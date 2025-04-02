import React, { createRef, useEffect, useState } from "react";
import {
    SearchIcon,
    DocumentSearchIcon,
    GlobeAltIcon,
    VideoCameraIcon,
    HomeIcon,
    DocumentTextIcon,
    ChatIcon,
    BookmarkIcon,
    InformationCircleIcon,
    MenuIcon,
} from '@heroicons/react/solid'
import { IParseResult } from "../../interfaces";
import classnames from "classnames";

const iconsMap = {
    web: GlobeAltIcon,
    find: DocumentSearchIcon,
    search: SearchIcon,
    youtube: VideoCameraIcon,
    home: HomeIcon,
    read: DocumentTextIcon,
    whatsapp: ChatIcon,
    history: BookmarkIcon,
    alternative: InformationCircleIcon,
    command: MenuIcon,
}

const Suggestion = ({ title, text, name, active, onClick, innerRef, label }) => {
    // Get the icon component from the map or default to MenuIcon if not found
    const IconComponent = name && iconsMap[name] ? iconsMap[name] : MenuIcon;

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
        <IconComponent className={classnames("mr-3 h-5 w-5", { ['text-stone-100']: active, ['text-stone-400']: !active })} aria-hidden="true" />
        {name === 'command' ? (
            <>
                <span className="font-medium">{label}</span>
                {text && <span className="ml-auto text-xs opacity-70">{text}</span>}
            </>
        ) : (
            <>
                <span className="font-thin">{title}</span>
                <span className="ml-2">{text}</span>
            </>
        )}
    </a >
}

export default function Suggestions({ items, selected, onClick }: { items: IParseResult[], selected: number, onClick: (item: IParseResult) => void }) {

    const [refs, setRefs] = useState([])

    useEffect(() => {
        setRefs(items.map(r => createRef()))
    }, [items])

    useEffect(() => {
        if (refs.length && refs[selected] && refs[selected].current) {
            refs[selected].current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }, [selected])

    return <div className="flex flex-col gap-1">
        {items.map((item, index) => <Suggestion
            name={item.name}
            innerRef={refs[index]}
            key={`${item.name}:${item.href || index}`}
            title={item.name}
            text={item.href}
            label={item.label}
            active={selected === index}
            onClick={() => onClick(item)}
        />)}
    </div>
}