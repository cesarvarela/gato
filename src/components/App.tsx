import React, { useEffect, useState } from "react";
import Palette from "./Palette";
import Mousetrap from 'mousetrap'
import SearchResults from "./ui/SearchResults";
import isURL from "validator/es/lib/isURL";

const { gato: { search, open, hide } } = window

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: true })
    const [results, setResults] = useState(null)

    useEffect(() => {

        Mousetrap.bind('command+p', () =>
            setPalette(palette => ({ ...palette, query: '', open: true })))

    }, [Mousetrap])

    const onAccept = async () => {

        if (isURL(palette.query, { require_protocol: false, require_tld: false })) {

            let url = palette.query

            if (!url.startsWith('http')) {

                url = `https://${url}`
            }

            open({ url })
            hide()
        }
        else {

            const results = await search({ q: palette.query })

            setPalette(palette => ({ ...palette, open: false }))
            setResults(results)

            console.log(results)
        }
    }

    const onCancelPalette = () => {

        if (results && results.length) {

            setPalette(value => ({ ...value, open: false }))
        }
        else {
            setPalette(value => ({ ...value, open: true }))
            hide()
        }
    }

    const onCancelResults = () => {

        setResults(null)
        setPalette(value => ({ ...value, open: true }))
        hide()
    }

    const onOpen = ({ result }) => {

        setPalette(value => ({ ...value, open: true }))
        open({ url: result.link })
        hide()
    }

    return <div>
        <div className="absolute">
            <Palette value={palette} setValue={setPalette} onAccept={onAccept} onCancel={onCancelPalette} />
            {results && <SearchResults value={results} onOpen={onOpen} onCancel={onCancelResults} />}
        </div>
    </div>
}

