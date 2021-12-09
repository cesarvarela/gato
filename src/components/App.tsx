import React, { useEffect, useState } from "react";
import Palette from "./Palette";
import Mousetrap from 'mousetrap'

export default function App() {

    const [palette, setPalette] = useState({ query: '', open: false })

    useEffect(() => {

        Mousetrap.bind('command+p', () => setPalette(palette => ({ ...palette, open: true })))

    }, [Mousetrap])

    return <div>
        <Palette value={palette} setValue={setPalette} />

        chukuy
    </div>
}

