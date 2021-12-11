import "tailwindcss/tailwind.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import Snacks from "../../components/Snacks";
import { QueryParamProvider } from "use-query-params";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <QueryParamProvider>
        <Snacks />
    </QueryParamProvider>
    , document.getElementById("root"));
