import React from "react";
import { DuplicateIcon } from '@heroicons/react/solid'
import { IParseResult } from "../../interfaces";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Suggestion = ({ text }) => {

    const active = false

    return <a
        href="#"
        className={classNames(
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            'group flex items-center px-4 py-2 text-sm'
        )}
    >
        <DuplicateIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        {text}
    </a>
}

export default function Suggestions({ items }: { items: IParseResult[] }) {

    return <div>
        {items.map(item => <Suggestion key={item.name} text={item.name} />)}
    </div>
}