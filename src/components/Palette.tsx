import React from "react";
import SearchInput from "./ui/SearchInput";

export default function Palette({ mode, innerRef, value, onChange, onAccept }) {

    return <div className="p-2">
        <SearchInput
            innerRef={innerRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onAccept={onAccept}
        />
    </div>
}