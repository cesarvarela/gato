import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import { QueryParamProvider } from "use-query-params";
import Error from "../../components/personas/Error";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(<QueryParamProvider><Error /></QueryParamProvider>, document.getElementById("root"));
