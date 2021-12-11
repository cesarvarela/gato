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

            try {

                const parsed = new URL(url)

                if (parsed.host.includes('youtube')) {

                    const matches = url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)

                    console.log(matches[5])

                    return open({ snack: 'youtubeVideo', params: { v: matches[5] } })
                }
            }
            catch (e) { }

            open({ snack: 'read', params: { url } })
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

