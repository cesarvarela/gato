import "tailwindcss/tailwind.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import Search from "../../components/snacks/Search";
import { QueryParamProvider } from "use-query-params";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <QueryParamProvider>
        <Search />
    </QueryParamProvider>
    , document.getElementById("root"));
