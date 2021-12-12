import React, { useCallback, useEffect, useState } from "react";
import Palette from "./Palette";

const { gato: { choose, open, hide, show, on } } = window

export default function App() {

    const [q, setQ] = useState("")

    useEffect(() => {

        on('call', (e, { params }) => {

            if (params.mode == 'location') {
                setQ(window.location.href)
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

