import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import SearchResults from "../ui/SearchResults";

const { gato: { search, open } } = window

export default function Search() {

    const [q] = useQueryParam('q', StringParam);
    const [results, setResults] = useState(null)

    const onOpen = ({ result }) => {

        open({ params: { url: result.link } })
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
        {window.location.href}
        {results && <SearchResults value={results} onOpen={onOpen} onCancel={() => false} />}
    </div>;
}