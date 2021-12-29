import React from "react";
import { DuplicateIcon } from '@heroicons/react/solid'
import { IParseResult } from "../../interfaces";
import classnames from "classnames";

const Suggestion = ({ text, active, onClick }) => {

    return <a
        href="#"
        className={classnames({ ['bg-gray-100 text-gray-900']: active, ['text-gray-700']: !active }, 'group flex items-center px-4 py-2 text-sm')}
        onClick={onClick}
    >
        <DuplicateIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        {text}
    </a >
}

export default function Suggestions({ items, selected, onClick }: { items: IParseResult[], selected: number, onClick: (item: IParseResult) => void }) {

    return <div>
        {items.map((item, index) => <Suggestion
            key={item.name}
            text={item.name}
            active={selected === index}
            onClick={() => onClick(item)}
        />)}
    </div>
}