import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";
import SnackHeader from "../ui/SnackHeader";

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

    return <div className="bg-stone-900 text-stone-300 p-4 min-h-full">
        {error && <div>{error}</div>}
        {results && results.length == 0 && <div>No results for {q}!</div>}
        {results && <>
            <SnackHeader title={<>Showing {results.length} results for {q}</>} onSettings={null} onClose={null} />
            <div className="mt-4">
                <SearchResults value={results} onOpen={onOpen} onCancel={() => false} />
            </div>
        </>}
    </div>
}