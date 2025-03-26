import React, { useEffect, useState } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { Helmet } from "react-helmet";
import Comment, { mapSnippet } from "../ui/Comment";

const { gato: { youtube } } = window

function YoutubeVideo() {
    const [v] = useQueryParam("v", StringParam);
    const [comments, setComments] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on load
    useEffect(() => {
        async function checkAuth() {
            try {
                const status = await youtube.isAuthenticated();
                setIsAuthenticated(status);
            } catch (e) {
                console.error("Auth check failed:", e);
            }
        }
        
        checkAuth();
    }, []);

    // Fetch comments when authenticated status changes
    useEffect(() => {
        async function fetchComments() {
            setIsLoading(true);
            try {
                const items = await youtube.getComments({ v });
                setComments(items || []);
            } catch (e) {
                console.error("Failed to fetch comments:", e);
                setError("Failed to load comments");
            } finally {
                setIsLoading(false);
            }
        }

        fetchComments();
    }, [v, isAuthenticated]);

    const handleSignIn = async () => {
        try {
            const success = await youtube.authenticate();
            if (success) {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Authentication failed:", e);
            setError("Authentication failed");
        }
    };

    const handleSignOut = async () => {
        try {
            await youtube.signOut();
            setIsAuthenticated(false);
            setComments([]);
        } catch (e) {
            console.error("Sign out failed:", e);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Helmet>
                <title>{v}</title>
            </Helmet>
            
            {/* Video player */}
            <div className="flex-grow">
                <webview 
                    className="h-full w-full" 
                    id="youtube" 
                    src={`https://www.youtube.com/embed/${v}?autoplay=0`}
                />
            </div>
            
            {/* Video info and auth controls */}
            <div className="flex justify-between items-center p-4 bg-gray-800">
                <div className="text-white">
                    {`https://www.youtube.com/watch?v=${v}`}
                </div>
                <div>
                    {isAuthenticated ? (
                        <button 
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button 
                            onClick={handleSignIn}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Sign In to YouTube
                        </button>
                    )}
                </div>
            </div>
            
            {/* Comments section */}
            <div className="p-4 overflow-y-auto max-h-96">
                <h2 className="text-lg font-semibold mb-4">Comments</h2>
                
                {isLoading && <p>Loading comments...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!isAuthenticated && !isLoading && (
                    <p className="text-gray-500">
                        Sign in to view comments
                    </p>
                )}
                
                {isAuthenticated && !isLoading && comments.length === 0 && (
                    <p className="text-gray-500">No comments found</p>
                )}
                
                {comments.map(comment => (
                    <Comment
                        key={comment.id}
                        {...mapSnippet(comment.snippet.topLevelComment.snippet)}
                        replies={comment.replies ? comment.replies.comments.map(reply => reply.snippet) : []}
                    />
                ))}
            </div>
        </div>
    );
}

export default YoutubeVideo;