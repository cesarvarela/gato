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

    const handleCall = useCallback(async (e, { params }: { params: IPaletteParams }) => {

        const { url, bounds } = await status()

        const fullBounds = { x: 0, y: 0, width: bounds.width, height: bounds.height }

        switch (params.mode) {

            case "location": {

                setQ(url.href)
                show({ bounds: fullBounds })
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
                show({ bounds: { ...fullBounds, height: 120 } })
                ref.current.focus()
            }
                break;

            case 'default': {

                show({ bounds: fullBounds })
                ref.current.focus()
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

