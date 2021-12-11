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
        <YouTube
            video={v}
            height={'100%'}
            width={'100%'}
            modestBranding={true}
            showRelatedVideos={false}
            autoplay
        />
    </div>
}

export default YoutubeVideo