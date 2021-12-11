import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";

const { gato: { search, open, choose } } = window

export default function Search() {

    const [q] = useQueryParam('q', StringParam);
    const [results, setResults] = useState(null)

    const onOpen = async ({ result }) => {

        const chosen = await choose({ q: result.link })

        open(chosen)
    }

    useEffect(() => {

        async function fetch() {

            const results = await search({ q })

            setResults(results)

            console.log(results)
        }

        fetch()

    }, []);

    return <div>
        {results && <SearchResults value={results} onOpen={onOpen} onCancel={() => false} />}
    </div>;
}