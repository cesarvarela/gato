import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";

const { gato: { read, open } } = window

export default function Reader() {

    const [url] = useQueryParam('url', StringParam)
    const [result, setResult] = useState({ content: '<p>Loading...</p>', title: '', author: '', date_published: '', })

    useEffect(() => {

        async function fetch() {

            try {
                const result = await read({ url })

                setResult(result)
            }
            catch (e) {

                open({ snack: null, params: { url } })
            }
        }

        fetch()

    }, []);

    const exitReader = () => {

        open({ snack: null, params: { url } })
    }

    return <div className="bg-white dark:bg-gray-900">
        <Helmet>
            <title>{url}</title>
        </Helmet>
        <div className="flex gap-2 p-6 justify-between prose dark:prose-invert max-w-none">
            <div >{url}</div>
            <button onClick={exitReader}>exit</button>
        </div >
        <article className="p-6 prose dark:prose-invert max-w-none">
            <h1 className=""> {result.title}</h1>
            <p>{result.author} {result.date_published}</p>
            <div dangerouslySetInnerHTML={{ __html: result.content.replace(/class/g, 'we') }} />
        </article>
    </div>

}