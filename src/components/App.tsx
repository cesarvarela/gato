import React, { useCallback, useEffect, useState } from "react";
import { IPaletteParams, PaletteMode } from "../interfaces";
import Palette from "./Palette";

const { gato: { choose, open, hide, show, on, status, find, stopFind } } = window

export default function App() {

    const [q, setQ] = useState("")
    const [mode, setMode] = useState<PaletteMode>("default")
    const [currentSerch, setCurrentSerch] = useState<string>("")

    useEffect(() => {

        on('call', async (e, { params }: { params: IPaletteParams }) => {

            switch (params.mode) {

                case "location": {

                    const s = await status()
                    setQ(s.url.href)
                    show()
                }
                    break;

                case "hide": {

                    stopFind({ action: 'keepSelection' })
                }
                    break;

                case "find": {

                    setQ(':')
                    show()
                }
                    break;

                case 'default': {

                    show()
                }
                    break;
            }
        })

    }, [])

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

    const onCancelPalette = () => {
        hide()
    }

    return <div>
        <div className="absolute">
            <Palette mode={mode} value={q} onChange={setQ} onAccept={onAccept} onCancel={onCancelPalette} />
        </div>
    </div>
}

