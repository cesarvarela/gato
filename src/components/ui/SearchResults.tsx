import Mousetrap from 'mousetrap'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'

function SearchResults({ value: results, onOpen, onCancel }) {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [refs, setRefs] = useState([])

    useEffect(() => {

        setSelectedIndex(0)
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

    const up = useCallback(() => {

        setSelectedIndex(index => index > 0 ? index - 1 : results.length - 1)

    }, [results])

    const down = useCallback(() => {

        setSelectedIndex(index => index < results.length - 1 ? index + 1 : 0)

    }, [results])

    const open = useCallback(({ target }) => {

        const result = results[selectedIndex]

        onOpen({ result, target })

    }, [results, selectedIndex])

    useEffect(() => {

        Mousetrap.bind('up', up)
        Mousetrap.bind('down', down)
        Mousetrap.bind('enter', () => open({ target: '_self' }))
        Mousetrap.bind('command+enter', () => open({ target: '_blank' }))
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

    return <table className="w-full">
        <tbody>
            {results.map((result, index) =>
                <tr tabIndex={-1}
                    ref={refs[index]}
                    key={result.link}
                    className={classnames(
                        "rounded-lg ring-inset focus:ring-2 focus:ring-pink-500 outline-none"
                    )} >

                    <td className="py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <div className="text-sm font-medium text-stone-300">
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