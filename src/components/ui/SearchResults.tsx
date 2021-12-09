import Mousetrap from 'mousetrap'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import { classnames } from 'tailwindcss-classnames'

function SearchResults({ value: results, onOpen, onCancel }) {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [refs, setRefs] = useState([])

    useEffect(() => {

        setSelectedIndex(0)
        setRefs(results.map(r => createRef()))

    }, [results])

    useEffect(() => {

        if (refs.length) {

            refs[selectedIndex].current.focus()
        }

    }, [selectedIndex])

    const up = useCallback(() => {

        setSelectedIndex(index => index > 0 ? index - 1 : results.length - 1)

    }, [results])

    const down = useCallback(() => {

        setSelectedIndex(index => index < results.length - 1 ? index + 1 : 0)

    }, [results])

    const open = useCallback(() => {

        const result = results[selectedIndex]

        onOpen({ result })

    }, [results, selectedIndex])

    useEffect(() => {

        Mousetrap.bind('up', up)
        Mousetrap.bind('down', down)
        Mousetrap.bind('enter', open)
        Mousetrap.bind('esc', onCancel)

        return () => {

            Mousetrap.unbind(['up', 'down', 'esc', 'enter'])
        }

    }, [Mousetrap, selectedIndex, results])

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

    return <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) =>
                <tr tabIndex={-1} ref={refs[index]} key={result.link} className={classnames({ "bg-gray-300": index == selectedIndex })} >
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {result.title}
                                </div>
                                <a tabIndex={-1} href={result.link} className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: result.htmlFormattedUrl }} />
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    </table>
}

export default SearchResults