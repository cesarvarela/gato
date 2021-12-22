import React from "react";
import YouTube from '@u-wave/react-youtube';
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";

function YoutubeVideo() {

    const [v] = useQueryParam("v", StringParam)

    console.log(v)

    return <div className="h-full">
        <Helmet>
            <title>{v}</title>
        </Helmet>
        <webview className="h-full" id="youtube" src={`https://www.youtube.com/embed/${v}?autoplay=0`}></webview>
    </div>
}

export default YoutubeVideo