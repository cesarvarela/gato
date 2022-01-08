import React, { createRef, useEffect, useState } from 'react'
import classnames from 'classnames'

function SearchResults({ value: results, selectedIndex }) {

    const [refs, setRefs] = useState([])

    useEffect(() => {
        setRefs(results.map(r => createRef()))

    }, [results])

    useEffect(() => {

        if (refs.length) {

            refs[0].current.focus()
        }

    }, [refs])

    useEffect(() => {

        if (refs.length) {

            refs[selectedIndex].current.focus()
        }

    }, [selectedIndex])

    if (results.length === 0) {

        return <div className="text-center">
            <span role="img" className="text-5xl">
                🙀
            </span>
            <p className="mt-6 text-gray-500">
                No results found!
            </p>
        </div>
    }

    return <div className="w-full">
        <div>
            {results.map((result, index) =>
                <div
                    tabIndex={-1}
                    ref={refs[index]}
                    key={result.link}
                    className={classnames(
                        "rounded-lg ring-inset focus:ring-2 focus:ring-pink-500 outline-none"
                    )} >

                    <div className="py-4">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <a tabIndex={-1} href={result.link} className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: result.htmlFormattedUrl }} />
                                <div
                                    className="text-sm text-stone-300"
                                    dangerouslySetInnerHTML={{ __html: result.htmlTitle }}
                                />
                                <div
                                    className="text-xs text-stone-500 mt-2 break-words"
                                    dangerouslySetInnerHTML={{ __html: result.htmlSnippet }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
}

export default SearchResults