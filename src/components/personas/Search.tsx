import React, { useCallback, useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";
import SnackHeader from "../ui/SnackHeader";
import Mousetrap from 'mousetrap'

const { gato: { search, gato: { open, choose } } } = window

export default function Search() {

    const [q] = useQueryParam('q', StringParam);
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {

        async function fetch() {

            try {
                setLoading(true)
                const results = await search.query({ q, start: (page - 1) * 10 + 1 })
                setResults(results)
                setSelectedIndex(0)
            }
            catch (e) {

                setError(e.message)
            }

            setLoading(false)
        }

        if (q) {

            fetch()
        }

    }, [search, page]);

    const onNextPage = useCallback(() => {

        if (!loading && page < 10 && results.length == 10) {

            setPage(page => page + 1)
        }

    }, [page, loading])

    const onPrevPage = useCallback(() => {

        if (!loading && page > 1) {

            setPage(page => page - 1)
        }

    }, [page, loading])

    const up = useCallback(() => {

        if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }

    }, [results, selectedIndex])

    const down = useCallback(() => {

        if (selectedIndex < results.length - 1) {

            setSelectedIndex(selectedIndex + 1)
        }

    }, [results, selectedIndex])

    const onOpen = useCallback(async ({ target }) => {

        const result = results[selectedIndex]
        const { href, name, params } = await choose({ q: result.link })

        open({ href, name, params: { ...params, target } })

    }, [results, selectedIndex])

    // TODO: this sucks
    useEffect(() => {

        Mousetrap.bind('up', up)
        Mousetrap.bind('down', down)
        Mousetrap.bind('right', onNextPage)
        Mousetrap.bind('left', onPrevPage)
        Mousetrap.bind('enter', () => onOpen({ target: '_self' }))
        Mousetrap.bind('command+enter', () => onOpen({ target: '_blank' }))

        return () => {

            Mousetrap.unbind(['up', 'down', 'right', 'left', 'enter', 'command+enter'])
        }

    }, [Mousetrap, results, selectedIndex, loading])

    if (!q) {

        return <div>No search query!</div>
    }

    return <div className="bg-stone-900 text-stone-300 p-4 min-h-full">
        {error && <div>{error}</div>}
        {results === undefined && <div>No results for {q}!</div>}
        {results && <>
            <SnackHeader title={<>Showing {results.length} results for <span className="font-bold">{q}</span>, page {page}</>} onSettings={null} onClose={null} />
            <div className="mt-4">
                <SearchResults
                    selectedIndex={selectedIndex}
                    value={results}
                />
            </div>
        </>}
    </div>
}