import React from "react";

const mapSnippet = snippet => ({
    text: snippet.textDisplay,
    author: snippet.authorDisplayName,
    profileImageUrl: snippet.authorProfileImageUrl,
})

export default function Comment({ profileImageUrl, author, text, replies = [] }) {

    return <>
        <div className="mt-6 flex">
            <div className="mr-4 flex-shrink-0">
                <img className="h-12 w-12 border border-gray-300 bg-white text-gray-300" src={profileImageUrl} />
            </div>
            <div>
                <h4 className="text-lg font-bold">{author}</h4>
                <p className="mt-1" dangerouslySetInnerHTML={{ __html: text }} />
            </div>
        </div>
        <div className="ml-8">
            {replies.map(reply => <Comment {...mapSnippet(reply)} />)}
        </div>
    </>
}

export { mapSnippet }