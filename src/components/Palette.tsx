import Mousetrap from "mousetrap";
import React, { useEffect } from "react";
import Modal from "./Modal";
import SearchInput from "./ui/SearchInput";


export default function Palette({ value, setValue, onAccept }) {

    useEffect(() => {

        Mousetrap.bind('esc', () => {

            setValue(value => ({ ...value, open: false }))
        })

        return () => {
            Mousetrap.unbind('esc')
        }

    }, [Mousetrap])

    const close = () => setValue(value => ({ ...value, open: false }))

    if (!value.open) {

        return null
    }

    return <Modal open={value.open}>

        <div className="bg-white p-2">

            <SearchInput value={value.query}
                onChange={(e) => setValue(value => ({ ...value, query: e.target.value }))}
                onCancel={close}
                onAccept={onAccept}
            />

        </div>

    </Modal>
}