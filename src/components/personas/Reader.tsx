import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";
import SnackHeader from "../ui/SnackHeader";
import { IReaderResult } from "../../interfaces";

const { gato: { reader, gato: { open } } } = window

export default function Reader() {

    const [url] = useQueryParam('url', StringParam)
    const [result, setResult] = useState<IReaderResult>({ content: '<p>Loading...</p>', title: '', author: '', date_published: '', })

    useEffect(() => {

        async function fetch() {

            try {
                const result = await reader.read({ url })

                setResult(result)
            }
            catch (e) {

                open({ href: url })
            }
        }

        fetch()

    }, []);

    const exitReader = () => {

        open({ href: url })
    }

    return <div className="bg-white dark:bg-gray-900 min-h-full p-4">
        <Helmet>
            <title>{url}</title>
        </Helmet>

        <SnackHeader title={url} onSettings={null} onClose={exitReader} />

        <article className="prose dark:prose-invert max-w-none mt-4">
            <h1 className=""> {result.title}</h1>
            <p>{result.author} {result.date_published}</p>
            <div dangerouslySetInnerHTML={{ __html: result.content }} />
        </article>
    </div>

}