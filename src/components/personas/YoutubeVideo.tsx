import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";
import Comment, { mapSnippet } from "../ui/Comment";

const { gato: { youtube } } = window

function YoutubeVideo() {

    const [v] = useQueryParam("v", StringParam)
    const [comments, setComments] = useState([])
    useEffect(() => {

        async function fetch() {

            try {
                const items = await youtube.getComments({ v })
                console.log('bue', items)
                setComments(items)
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

        <div>
            {`https://www.youtube.com/watch?v=${v}`}
        </div>

        <div className="p-4">
            {comments.map(comment => <Comment
                key={comment.id}
                {...mapSnippet(comment.snippet.topLevelComment.snippet)}
                replies={comment.replies ? comment.replies.comments.map(reply => reply.snippet) : []}
            />)}
        </div>
    </div>
}

export default YoutubeVideo