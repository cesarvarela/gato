import React, { useState } from "react";
import Palette from "./Palette";
import isURL from "validator/es/lib/isURL";

const { gato: { open, hide } } = window

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: true })

    const onAccept = async () => {

        if (isURL(palette.query, { require_tld: true, require_protocol: false }) || isURL(palette.query, { require_protocol: true, require_tld: false, require_port: true })) {

            let url = palette.query

            if (!url.startsWith('http')) {

                url = `https://${url}`
            }

            open({ params: { url } })
        }
        else {

            open({ snack: 'search', params: { q: palette.query } })
        }

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

