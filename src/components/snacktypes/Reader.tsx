import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";

const { gato: { read, open } } = window

export default function Reader() {

    const [url] = useQueryParam('url', StringParam)
    const [content, setContent] = useState('<p>Loading...</p>')

    useEffect(() => {

        async function fetch() {

            try {
                const result = await read({ url })

                setContent(result.content)
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

    return <div>
        <Helmet>
            <meta charSet="utf-8" />
            <title>{url}</title>
            <link rel="canonical" href={url} />
        </Helmet>
        <div className="border flex gap-2 p-2">
            <div >{url}</div>
            <button onClick={exitReader}>exit</button>
        </div >
        <div className="p-6" dangerouslySetInnerHTML={{ __html: content }} />
    </div>

}