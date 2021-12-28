import React, { useCallback, useEffect, useRef, useState } from "react";
import Palette from "./Palette";
const { gato: { gato: { choose, open, hide, show, status }, find: { find, stopFind }, on } } = window

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

        async function update(q) {
            const { name } = await choose({ q })

            setMode(name)
            showPalette(name, ref)
        }

        update(q)

    }, [q, ref])

    const onAccept = useCallback(async () => {

        if (mode == 'find') {

            const tokens = q.split(':')
            const text = tokens.slice(1).join('')

            await find({ text, findNext: currentSerch !== text })

            setCurrentSerch(text)
        }
        else {

            const chosen = await choose({ q })

            open(chosen)

            hide()
        }

    }, [q, currentSerch])

    return <>
        <div className="flex flex-col items-stretch justify-start w-full self-stretch">
            <Palette innerRef={ref} mode={mode} value={q} onChange={setQ} onAccept={onAccept} />
            <div className="flex flex-1 dark:text-white">
                {mode}
            </div>
        </div>
    </>
}

