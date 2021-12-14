import React from "react";
import { classnames } from "tailwindcss-classnames";

export default function Button(props) {

    return <button
        {...props}
        className={
            classnames(props.className, 'border', 'py-0', 'px-2', 'rounded', 'text-sm', 'border-gray-600'
            )}
    />
}