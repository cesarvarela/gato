import React from "react";
import Button from "./Button";

export default function SnackHeader({ title, onSettings, onClose }) {
    return (
        <div className="border dark:border-gray-600 rounded dark:text-gray-400 flex justify-between p-2">
            <div>
                {title}
            </div>
            <div className="flex gap-2">
                {onSettings && <Button onClick={onSettings}>settings</Button>}
                {onClose && <Button className="btn btn-link" onClick={onClose}>exit</Button>}
            </div>
        </div>
    );
}