import React from "react";
import Modal from "./Modal";
import SearchInput from "./ui/SearchInput";

export default function Palette({ mode, value, onChange, onCancel, onAccept }) {

    return <Modal open={true}>

        <div className="bg-white p-2">

            <SearchInput value={value}
                onChange={(e) => onChange(e.target.value)}
                onCancel={onCancel}
                onAccept={onAccept}
            />
            {mode}
        </div>

    </Modal>
}