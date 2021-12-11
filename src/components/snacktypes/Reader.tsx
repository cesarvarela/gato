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
                console.log(result)
            }
            catch (e) {

                open({ snack: null, params: { url } })
            }
        }

        fetch()

    }, []);

    return <div>
        <Helmet>
            <meta charSet="utf-8" />
            <title>{url}</title>
            <link rel="canonical" href={url} />
        </Helmet>
        <div>{url}</div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>

}