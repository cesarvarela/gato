import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Palette from "./Palette";

const { gato: { gato: { choose, open, hide, show, status, find, stopFind }, on, off, } } = window

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

    const handleCall = useCallback(async (e, { params }: { params }) => {

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
    }, [mode, ref])

    useEffect(() => {

        on('call', handleCall)

        return () => {
            off('call', handleCall)
        }

    }, [on])

    useEffect(() => {

        async function update(q) {
            const { snack } = await choose({ q })

            setMode(snack)
            showPalette(snack, ref)
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

    return <Modal open={true}>
        <div className="flex flex-col items-stretch justify-start w-full self-stretch">
            <Palette innerRef={ref} mode={mode} value={q} onChange={setQ} onAccept={onAccept} />
            <div className="flex flex-1" />
        </div>
    </Modal>
}

