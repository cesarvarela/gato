import React, { createRef, useEffect, useState } from "react";
import { SearchIcon, DocumentSearchIcon, GlobeAltIcon, VideoCameraIcon, HomeIcon, DocumentTextIcon, ChatIcon, BookmarkIcon } from '@heroicons/react/solid'
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
    history: BookmarkIcon,
}

const Suggestion = ({ title, text, name, active, onClick, innerRef }) => {

    const Icon = iconsMap[name]

    return <a
        ref={innerRef}
        href="#"
        className={classnames({
            ['bg-purple-700 text-stone-100']: active,
            ['bg-stone-900 text-stone-400']: !active
        },
            'group flex items-center px-4 py-2 text-xs rounded-lg cursor-pointer'
        )}
        onClick={onClick}
    >
        <Icon className={classnames("mr-3 h-5 w-5", { ['text-stone-100']: active, ['text-stone-400']: !active })} aria-hidden="true" />
        <span className="font-thin">{title}</span>
        <span className="ml-2">{text}</span>
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

    return <div className="flex flex-col gap-1">
        {items.map((item, index) => <Suggestion
            name={item.name}
            innerRef={refs[index]}
            key={`${item.name}:${item.href}`}
            title={item.name}
            text={item.href}
            active={selected === index}
            onClick={() => onClick(item)}
        />)}
    </div>
}