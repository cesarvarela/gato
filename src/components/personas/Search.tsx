import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";

const { gato: { search, gato: { open, choose } } } = window

export default function Search() {

    const [q] = useQueryParam('q', StringParam);
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)

    const onOpen = async ({ result, target }) => {

        const { href, name, params } = await choose({ q: result.link })

        open({ href, name, params: { ...params, target } })
    }

    useEffect(() => {

        async function fetch() {

            try {

                const results = await search.query({ q })
                setResults(results)
            }
            catch (e) {

                setError(e.message)
            }
        }

        if (q) {

            fetch()
        }

    }, [search]);

    if (!q) {

        return <div>No search query!</div>
    }

    return <div>
        {error && <div>{error}</div>}
        {results && results.length == 0 && <div>No results for {q}!</div>}
        {results && <SearchResults value={results} onOpen={onOpen} onCancel={() => false} />}
    </div>;
}