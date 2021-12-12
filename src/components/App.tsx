import React, { useCallback, useEffect, useState } from "react";
import Palette from "./Palette";

const { gato: { choose, open, hide, show, on, status } } = window

export default function App() {

    const [q, setQ] = useState("")

    useEffect(() => {

        on('call', async (e, { params }) => {

            const s = await status()

            if (params.mode == 'location') {
                setQ(s.url.href)
            }

            show()
        })

    }, [])

    const onAccept = useCallback(async () => {

        const chosen = await choose({ q })

        open(chosen)

        hide()
    }, [q])

    const onCancelPalette = () => {
        hide()
    }

    return <div>
        <div className="absolute">
            <Palette value={q} onChange={setQ} onAccept={onAccept} onCancel={onCancelPalette} />
        </div>
    </div>
}

