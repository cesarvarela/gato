import './index.css';
import "tailwindcss/tailwind.css"
import React from "react";
import ReactDOM from "react-dom";

declare global {
    interface Window {
    }
}

ReactDOM.render(<div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">holis </div>, document.getElementById("root"));
