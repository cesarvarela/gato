import React, { createRef, useEffect, useState } from "react";
import { SearchIcon, DocumentSearchIcon, GlobeAltIcon, VideoCameraIcon, HomeIcon, DocumentTextIcon, ChatIcon } from '@heroicons/react/solid'
import { IParseResult, PersonaName } from "../../interfaces";
import classnames from "classnames";

const iconsMap: Record<Partial<PersonaName>, unknown> = {
    web: GlobeAltIcon,
    find: DocumentSearchIcon,
    search: SearchIcon,
    youtube: VideoCameraIcon,
    home: HomeIcon,
    read: DocumentTextIcon,
    whatsapp: ChatIcon,
}

const Suggestion = ({ text, name, active, onClick, innerRef }) => {

    const Icon = iconsMap[name]

    return <a
        ref={innerRef}
        href="#"
        className={classnames({
            ['bg-stone-800 text-stone-400 ring-2 ring-purple-500 ring-inset']: active,
            ['bg-stone-800 text-stone-500']: !active
        },
            'group flex items-center px-4 py-2 text-sm rounded-sm'
        )}
        onClick={onClick}
    >
        <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        {text}
    </a >
}

export default function Suggestions({ items, selected, onClick }: { items: IParseResult[], selected: number, onClick: (item: IParseResult) => void }) {

    const [refs, setRefs] = useState([])

    useEffect(() => {

        setRefs(items.map(r => createRef()))

    }, [items])

    useEffect(() => {

        if (refs.length) {

            refs[selected].current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }

    }, [selected])

    return <div className="flex flex-col gap-2">
        {items.map((item, index) => <Suggestion
            name={item.name}
            innerRef={refs[index]}
            key={item.name}
            text={item.name}
            active={selected === index}
            onClick={() => onClick(item)}
        />)}
    </div>
}