import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import { QueryParamProvider } from "use-query-params";
import Reader from "../../components/personas/Reader";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <QueryParamProvider>
        <Reader />
    </QueryParamProvider>
    , document.getElementById("root"));
