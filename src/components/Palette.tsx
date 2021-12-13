import React from "react";
import SearchInput from "./ui/SearchInput";

export default function Palette({ mode, value, onChange, onAccept }) {

    return <div className="p-2">
        <SearchInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onAccept={onAccept}
        />
        {mode}
    </div>
}