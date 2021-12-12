import React from "react";

export default function Modal({ open, children }) {

    if (!open) {

        return null
    }

    return <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
        <div className="flex items-center justify-center h-full">
            {children}
        </div>
    </div>
}