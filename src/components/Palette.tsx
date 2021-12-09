import React from "react";
import Modal from "./Modal";
import SearchInput from "./ui/SearchInput";

export default function Palette({ value, setValue, onCancel, onAccept }) {

    if (!value.open) {

        return null
    }

    return <Modal open={value.open}>

        <div className="bg-white p-2">

            <SearchInput value={value.query}
                onChange={(e) => setValue(value => ({ ...value, query: e.target.value }))}
                onCancel={onCancel}
                onAccept={onAccept}
            />

        </div>

    </Modal>
}