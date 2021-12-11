import React, { useState } from "react";
import Palette from "./Palette";

const { gato: { choose, open, hide } } = window

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: true })

    const onAccept = async () => {

        const chosen = await choose({ q: palette.query })

        open(chosen)

        hide()
    }

    const onCancelPalette = () => {
        hide()
    }

    return <div>
        <div className="absolute">
            <Palette value={palette} setValue={setPalette} onAccept={onAccept} onCancel={onCancelPalette} />
        </div>
    </div>
}

