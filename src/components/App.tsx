import React, { useEffect, useState } from "react";
import Palette from "./Palette";
import Mousetrap from 'mousetrap'
import SearchResults from "./ui/SearchResults";
import Home from "./Home";

const { gato: { search } } = window

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: false })
    const [results, setResults] = useState(null)

    useEffect(() => {

        Mousetrap.bind('command+p', () => setPalette(palette => ({ ...palette, open: true })))

    }, [Mousetrap])


    const onAccept = async () => {

        const results = await search({ q: palette.query })

        setPalette(palette => ({ ...palette, open: false }))
        setResults(results)

        console.log(results)

    }


    return <div>
        <Palette value={palette} setValue={setPalette} onAccept={onAccept} />
        {results == null && <Home />}
        {results && <SearchResults results={results} />}
    </div>
}

