import React, { useCallback, useEffect, useRef, useState } from "react";
import { IParseResult } from "../interfaces";
import SearchInput from "./ui/SearchInput";
import Suggestions from "./ui/Suggestions";
const { gato: { gato: { parse, open, hide, show, status }, find: { find, stopFind }, on } } = window

const paletteSize = { width: 720, height: 400 }

const resizePalette = async (mode) => {

    const { bounds: windowBounds } = await status()
    let bounds

    switch (mode) {
        case 'empty':
        case 'find':
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 96,
            }
            break;

        default:
            bounds = {
                x: Math.round(windowBounds.width / 2 - paletteSize.width / 2),
                y: 0,
                width: paletteSize.width,
                height: 240,
            }
            break;
    }

    await show({ bounds })
}

export default function App() {

    const [q, setQ] = useState("")
    const [mode, setMode] = useState("")
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
                    resizePalette(params.mode)
                    ref.current.focus()
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
                    resizePalette(params.mode)
                    ref.current.focus()
                }
                    break;

                case 'show': {

                    resizePalette(params.mode)
                    ref.current.focus()
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
            else if (suggestions.length === 0) {

                setMode('empty')
            }
            else {
                setMode('default')
            }
        }

        update()

    }, [q])

    useEffect(() => {
        if (suggestions.length == 0) {
            setSelected(0)
        }
        else if (selected > suggestions.length - 1) {
            setSelected(suggestions.length - 1)
        }
    }, [selected, suggestions])

    useEffect(() => {
        resizePalette(mode)
    }, [mode])

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

    return <div className="h-full w-full">
        <div className="inset-x-6 inset-y-4 absolute z-10 bg-stone-900 dejame-vivir rounded-xl">
            <div className="flex flex-col h-full w-full rounded-xl z-20 p-3 border border-stone-600">
                <SearchInput
                    innerRef={ref}
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    onUp={onUp}
                    onDown={onDown}
                    onAccept={onAccept}
                />
                {mode !== 'find' && suggestions.length > 0 &&
                    <div className="overflow-y-scroll flex-1 mt-2 z-10">
                        <Suggestions items={suggestions} selected={selected} onClick={onSuggestionsClick} />
                    </div>
                }
            </div>
        </div>
    </div>
}

