import React, { useEffect, useState } from "react";
import Palette from "./Palette";
import Mousetrap from 'mousetrap'

const { gato: { search } } = window

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: false })

    useEffect(() => {

        Mousetrap.bind('command+p', () => setPalette(palette => ({ ...palette, open: true })))

    }, [Mousetrap])


    const onAccept = async () => {

        const results = await search({ q: palette.query })

        console.log(results)
    }


    return <div>
        <Palette value={palette} setValue={setPalette} onAccept={onAccept} />

        chukuy
    </div>
}

