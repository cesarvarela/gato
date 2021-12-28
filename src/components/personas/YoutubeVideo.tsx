import React, { useEffect } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";

const { gato: { youtube } } = window

function YoutubeVideo() {

    const [v] = useQueryParam("v", StringParam)

    useEffect(() => {

        async function fetch() {

            try {
                const items = await youtube.getComments({ v })
                console.log(items)
            }
            catch (e) {

                console.log(e)
            }
        }

        fetch()

    }, [])

    return <div className="h-full">
        <Helmet>
            <title>{v}</title>
        </Helmet>
        <webview className="h-full" id="youtube" src={`https://www.youtube.com/embed/${v}?autoplay=0`}></webview>
    </div>
}

export default YoutubeVideo