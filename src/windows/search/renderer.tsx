import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import { QueryParamProvider } from "use-query-params";
import Search from "../../components/personas/Search";

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
