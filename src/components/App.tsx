import React, { useCallback, useEffect, useState } from "react";
import { IPaletteParams, PaletteMode } from "../interfaces";
import Modal from "./Modal";
import Palette from "./Palette";

const { gato: { choose, open, hide, show, on, status, find, stopFind } } = window

export default function App() {

    const [q, setQ] = useState("")
    const [mode, setMode] = useState<PaletteMode>("default")
    const [currentSerch, setCurrentSerch] = useState<string>("")


    const handleCall = useCallback(async (e, { params }: { params: IPaletteParams }) => {

        const { url, bounds } = await status()

        const fullBounds = { x: 0, y: 0, width: bounds.width, height: bounds.height }

        switch (params.mode) {

            case "location": {

                setQ(url.href)
                show({ bounds: fullBounds })
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
            }
                break;

            case 'default': {

                show({ bounds: fullBounds })
            }
                break;
        }
    }, [mode])

    useEffect(() => {

        on('call', handleCall)

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
        <Palette mode={mode} value={q} onChange={setQ} onAccept={onAccept} />
    </Modal>
}

