import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";

const { gato: { search, gato: { open, choose } } } = window

export default function Search() {

    const [q] = useQueryParam('q', StringParam);
    const [results, setResults] = useState(null)

    const onOpen = async ({ result, target }) => {

        const { snack, params } = await choose({ q: result.link })

        open({ snack, params: { ...params, target } })
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