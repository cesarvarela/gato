import React, { useCallback, useEffect, useRef, useState } from "react";
import { IParseResult } from "../interfaces";
import SearchInput from "./ui/SearchInput";
import Suggestions from "./ui/Suggestions";
const { gato: { gato: { choose, parse, open, hide, show, status }, find: { find, stopFind }, on } } = window

const paletteSize = { width: 640, height: 720 }

const showPalette = async (mode, ref) => {

    const { bounds: windowBounds } = await status()
    let bounds

    switch (mode) {
        case 'find':
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 80,
            }
            break;

        default:
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: Math.min(paletteSize.height, Math.round(windowBounds.height / 2)),
            }
            break;
    }

    ref.current.focus()

    await show({ bounds })
}

export default function App() {

    const [q, setQ] = useState("")
    const [mode, setMode] = useState("show")
    const [currentSerch, setCurrentSerch] = useState<string>("")
    const ref = useRef<HTMLInputElement>(null)
    const [suggestions, setSuggestions] = useState<IParseResult[]>([])
    const [selected, setSelected] = useState(0)

    useEffect(() => {

        const handleCall = async (e, { params }: { params }) => {

            console.log('handleCall')

            const { url } = await status()

            switch (params.mode) {

                case "location": {

                    setQ(url.href)
                    showPalette(params.mode, ref)
                }
                    break;

                case "hide": {

                    if (mode === 'find') {
                        stopFind({ action: 'keepSelection' })
                    }

                    hide()
                }
                    break;

                case "find": {

                    setQ(':')
                    showPalette(params.mode, ref)
                }
                    break;

                case 'show': {

                    showPalette(params.mode, ref)
                }
                    break;
            }
        }

        const dispose = on('call', handleCall)

        return () => {

            dispose()
        }
    }, [mode, ref])

    useEffect(() => {

        async function update() {
            const suggestions = await parse({ q })
            setSuggestions(suggestions)

            const first = suggestions[0]

            if (first && first.params && first.params.paletteMode) {
                setMode(first.params.paletteMode as string)
            }
            else {
                setMode('default')
            }
        }

        update()

    }, [q])

    const onAccept = useCallback(async () => {

        if (mode == 'find') {

            const tokens = q.split(':')
            const text = tokens.slice(1).join('')

            await find({ text, findNext: currentSerch !== text })

            setCurrentSerch(text)
        } else {

            const chosen = suggestions[selected]
            open(chosen)

            hide()
        }

    }, [q, selected, suggestions, currentSerch])

    const onDown = useCallback(() => {

        if (selected < suggestions.length - 1) {
            setSelected(selected + 1)
        }
        else {
            setSelected(0)
        }
    }, [selected, suggestions])

    const onUp = useCallback(() => {

        if (selected > 0) {
            setSelected(selected - 1)
        }
        else {
            setSelected(suggestions.length - 1)
        }
    }, [selected, suggestions])

    const onSuggestionsClick = (item) => {
        open(item)
        hide()
    }

    console.log(mode, q, suggestions, suggestions[selected])

    return <div className="p-2 border h-full w-full">
        <div className="flex flex-col items-stretch justify-start w-full bg-white shadow">
            <SearchInput
                innerRef={ref}
                value={q}
                onChange={e => setQ(e.target.value)}
                onUp={onUp}
                onDown={onDown}
                onAccept={onAccept}
            />
            {mode !== 'find' &&
                <Suggestions items={suggestions} selected={selected} onClick={onSuggestionsClick} />
            }
        </div>
    </div>
}

