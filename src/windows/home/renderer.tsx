import "tailwindcss/tailwind.css"
import React from "react";
import ReactDOM from "react-dom";
import Home from "../../components/Home";
import { IGato } from "../../interfaces";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(<Home />, document.getElementById("root"));
