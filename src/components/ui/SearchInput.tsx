import React from 'react'

function SearchInput({ innerRef, value, onChange, onAccept, onUp, onDown, onCommandMode }) {
    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            onDown()
            e.preventDefault()
        }
        if (e.key === 'ArrowUp') {
            onUp()
            e.preventDefault()
        }
        if (e.key === "Enter") {
            onAccept()
        }
        // Check for '>' symbol to trigger command mode, but don't trigger if we're already typing
        // Let the onChange handler handle it instead when there's already text
        if (e.key === '>' && value === '') {
            if (onCommandMode) {
                e.preventDefault() // Prevent the '>' character from being added by the input
                onCommandMode()
            }
        }
    }

    return <div className="relative h-full w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
        </span>
        <input
            ref={innerRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            type="text"
            className="p-2 pl-10 h-full w-full rounded-lg bg-stone-800 text-stone-300 placeholder:text-stone-500 focus:outline-none font-normal text-sm"
            placeholder="Type search queries, URLs or something else"
        />
    </div>
}

export default SearchInput