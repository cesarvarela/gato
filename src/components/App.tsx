import React, { useCallback, useEffect, useRef, useState } from "react";
import { IPaletteParams, PaletteMode } from "../interfaces";
import Modal from "./Modal";
import Palette from "./Palette";

const { gato: { choose, open, hide, show, on, off, status, find, stopFind } } = window

export default function App() {

    const [q, setQ] = useState("")
    const [mode, setMode] = useState<PaletteMode>("default")
    const [currentSerch, setCurrentSerch] = useState<string>("")
    const ref = useRef<HTMLInputElement>(null)
    const paletteSize = { width: 640, height: 720 }

    const showPalette = useCallback(async () => {

        const { bounds: windowBounds } = await status()

        const bounds = {
            x: windowBounds.width / 2 - paletteSize.width / 2,
            y: 0,
            width: paletteSize.width,
            height: Math.min(paletteSize.height, Math.round(windowBounds.height / 2)),
        }

        await show({ bounds })

        ref.current.focus()

    }, [ref])

    const handleCall = useCallback(async (e, { params }: { params: IPaletteParams }) => {

        const { url } = await status()

        switch (params.mode) {

            case "location": {

                setQ(url.href)
                showPalette()
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
                showPalette()
            }
                break;

            case 'default': {

                showPalette()
            }
                break;
        }
    }, [mode])

    useEffect(() => {

        on('call', handleCall)

        return () => {
            off('call', handleCall)
        }

    }, [mode])

    useEffect(() => {

        if (q.startsWith(':')) {

            setMode('find')
        }
        else {

            setMode('default')
        }

    }, [q])

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
        <Palette innerRef={ref} mode={mode} value={q} onChange={setQ} onAccept={onAccept} />
    </Modal>
}

