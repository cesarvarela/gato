import React, { useCallback, useEffect, useRef, useState } from "react";
import { IParseResult, PaletteMode } from "../interfaces";
import SearchInput from "./ui/SearchInput";
import Suggestions from "./ui/Suggestions";

// Access only what we need and avoid nested destructuring for clarity
const { gato } = window;
const { parse, open, hide, show, status } = gato.gato;
const { find, stopFind } = gato.find;
const { on } = gato;
// menu is directly on gato object based on preload.ts

const paletteSize = { width: 720, height: 400 };

const resizePalette = async (mode: PaletteMode) => {
    const { bounds: windowBounds } = await status();
    let bounds;

    switch (mode) {
        case "find":
        case "location":
        case "compact":
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 92,
            };
            break;

        case "full":
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 240,
            };
            break;

        case "hidden":
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 0,
            };
            break;

        default:
            throw new Error(`Unknown mode: ${mode}`);
    }

    await show({ bounds });
};

export default function App() {
    const [q, setQ] = useState("");
    const [mode, setMode] = useState<PaletteMode>("hidden");
    const [currentSerch, setCurrentSerch] = useState<string>("");
    const ref = useRef<HTMLInputElement>(null);
    const [suggestions, setSuggestions] = useState<IParseResult[]>([]);
    const [selected, setSelected] = useState(0);
    const [isCommandMode, setIsCommandMode] = useState(false);
    const [commands, setCommands] = useState([]);
    const [filteredCommands, setFilteredCommands] = useState([]);

    useEffect(() => {
        const handleCall = async (e, { params }: { params: { mode: PaletteMode } }) => {
            console.log("handleCall", params.mode);

            const { url } = await status();

            if (params.mode) {
                setMode(params.mode);
            }

            switch (params.mode) {
                case "location": {
                    setQ(url.href);
                    resizePalette(params.mode);
                    ref.current.focus();
                }
                    break;

                case "hidden": {
                    if (mode === "find") {
                        stopFind({ action: "keepSelection" });
                    }

                    setIsCommandMode(false);
                    resizePalette(params.mode);
                }
                    break;

                case "find": {
                    setQ(":");
                    resizePalette(params.mode);
                    ref.current.focus();
                }
                    break;

                case "compact":
                case "full": {
                    resizePalette(params.mode);
                    ref.current.focus();
                }
                    break;
            }
        };

        const dispose = on("call", handleCall);

        return () => {
            dispose();
        };
    }, [mode, ref]);

    useEffect(() => {
        async function update() {
            if (isCommandMode) {
                // Filter commands based on the query (remove the '>' prefix)
                const query = q.startsWith(">") ? q.substring(1).trim().toLowerCase() : "";
                const filtered = commands.filter(cmd =>
                    cmd.type !== "separator" &&
                    (query === "" || (cmd.label && cmd.label.toLowerCase().includes(query)))
                );
                setFilteredCommands(filtered);
                setMode("full");
            } else if (selected == 0) {
                const suggestions = await parse({ q });
                setSuggestions(suggestions);

                const first = suggestions[0];
                if (first && first.params && first.params.paletteMode) {
                    setMode(first.params.paletteMode as PaletteMode);
                }
                else if (suggestions.length === 0) {
                    setMode("compact");
                }
                else {
                    setMode("full");
                }
            }
        }

        if (mode !== "hidden") {
            update();
        }
    }, [q, mode, isCommandMode, commands, selected]);

    useEffect(() => {
        if (!isCommandMode && suggestions.length == 0) {
            setSelected(0);
        }
        else if (!isCommandMode && selected > suggestions.length - 1) {
            setSelected(suggestions.length - 1);
        } else if (isCommandMode && filteredCommands.length > 0) {
            if (selected >= filteredCommands.length) {
                setSelected(filteredCommands.length - 1);
            }
        }
    }, [selected, suggestions, filteredCommands, isCommandMode]);

    useEffect(() => {
        resizePalette(mode);
    }, [mode]);

    // Fetch menu commands when entering command mode
    useEffect(() => {
        async function fetchCommands() {
            if (isCommandMode) {
                try {
                    // Fetch commands dynamically from the centralized module
                    const menuData = await gato.menu();
                    const allCommands = menuData.commands || [];
                    setCommands(allCommands);
                    setFilteredCommands(allCommands.filter(cmd => cmd.type !== "separator"));
                    setMode("full");
                } catch (error) {
                    console.error("Error fetching menu commands:", error);
                }
            }
        }

        fetchCommands();
    }, [isCommandMode]);

    useEffect(() => {
        console.log('gato object in renderer:', window.gato);
    }, []);

    const onCommandMode = useCallback(() => {
        // Enter command mode but let the input handler handle setting the value
        setIsCommandMode(true);
        setQ(">");
        setSelected(0);
        setMode("full");
    }, []);

    const onAccept = useCallback(async () => {
        console.log("onAccept called, mode:", mode, "isCommandMode:", isCommandMode);

        if (mode == "find") {
            const tokens = q.split(":");
            const text = tokens.slice(1).join("");
            await find({ text, findNext: currentSerch !== text });
            setCurrentSerch(text);
        } else if (isCommandMode) {
            // Execute the selected command
            console.log("Command mode - selected index:", selected);
            console.log("filteredCommands length:", filteredCommands.length);

            if (selected >= 0 && selected < filteredCommands.length) {
                const selectedCommand = filteredCommands[selected];
                console.log("Selected command:", selectedCommand);

                if (selectedCommand) {
                    try {
                        console.log("Executing command:", selectedCommand.label);

                        // Execute the command via IPC
                        await gato.command.executeCommand({ command: selectedCommand.id });

                        // Hide the palette after executing a command
                        console.log("Hiding palette after command execution");
                        await hide();
                        setIsCommandMode(false);
                    } catch (error) {
                        console.error("Error executing command:", error);
                    }
                } else {
                    console.warn("Selected command is undefined");
                }
            } else {
                console.warn("Selected index is out of bounds:", selected);
            }
        } else {
            const chosen = suggestions[selected];
            open(chosen);
            hide();
        }
    }, [q, mode, selected, suggestions, currentSerch, isCommandMode, filteredCommands, hide]);

    const onDown = useCallback(() => {
        if (isCommandMode) {
            const next = selected < filteredCommands.length - 1 ? selected + 1 : 0;
            setSelected(next);
        } else {
            const next = selected < suggestions.length - 1 ? selected + 1 : 0;
            setSelected(next);
            setQ(suggestions[next].q || suggestions[next].href);
        }
    }, [selected, suggestions, isCommandMode, filteredCommands]);

    const onUp = useCallback(() => {
        if (isCommandMode) {
            const next = selected > 0 ? selected - 1 : filteredCommands.length - 1;
            setSelected(next);
        } else {
            const next = selected > 0 ? selected - 1 : suggestions.length - 1;
            setSelected(next);
            setQ(suggestions[next].q || suggestions[next].href);
        }
    }, [selected, suggestions, isCommandMode, filteredCommands]);

    const onChange = useCallback((e) => {
        setSelected(0);
        setQ(e.target.value);

        // Check if we're leaving command mode
        if (isCommandMode && !e.target.value.startsWith(">")) {
            setIsCommandMode(false);
        }
        // Check if we're entering command mode through typing '>' directly
        else if (!isCommandMode && e.target.value === ">") {
            setIsCommandMode(true);
            setMode("full");
        }
    }, [isCommandMode]);

    const onSuggestionsClick = useCallback((item) => {
        if (isCommandMode) {
            // Execute the clicked command
            if (item.click) {
                item.click(item);
                hide();
                setIsCommandMode(false);
            }
        } else {
            open(item);
            hide();
        }
    }, [isCommandMode]);

    useEffect(() => {
        async function fetch() {
            const { url: { href } } = await status();

            if (href === "gato://home/") {
                setMode("compact");
                ref.current.focus();
            }
        }

        if (ref) {
            fetch();
        }
    }, [status, ref]);

    // Map command items to IParseResult format for Suggestions component
    const commandsToSuggestions = useCallback((commands) => {
        return commands.map((cmd) => ({
            name: "command",
            href: cmd.accelerator || "",
            label: cmd.label,
            click: cmd.click,
            originalCommand: cmd  // Store the original command in case we need it
        }));
    }, []);

    useEffect(() => {
        const handleGatoCall = (event) => {
            const { params } = event.detail;
            console.log('Received gato:call message with params:', params);
            // Adjust the palette mode or perform other actions based on params
        };

        window.addEventListener('gato:call', handleGatoCall);

        return () => {
            window.removeEventListener('gato:call', handleGatoCall);
        };
    }, []);

    return <div className="h-full w-full">
        <div className="inset-x-6 inset-y-4 absolute z-10 bg-stone-900 dejame-vivir rounded-xl">
            <div className="flex flex-col h-full w-full rounded-xl z-20 p-3 border border-stone-600 gap-2">
                <div className="flex-initial">
                    <SearchInput
                        innerRef={ref}
                        value={q}
                        onChange={onChange}
                        onUp={onUp}
                        onDown={onDown}
                        onAccept={onAccept}
                        onCommandMode={onCommandMode}
                    />
                </div>
                {mode !== "find" && !isCommandMode && suggestions.length > 0 &&
                    <div className="overflow-y-scroll flex-1 z-10">
                        <Suggestions items={suggestions} selected={selected} onClick={onSuggestionsClick} />
                    </div>
                }
                {isCommandMode && filteredCommands.length > 0 &&
                    <div className="overflow-y-scroll flex-1 z-10">
                        <Suggestions items={commandsToSuggestions(filteredCommands)} selected={selected} onClick={onSuggestionsClick} />
                    </div>
                }
            </div>
        </div>
    </div>;
}

