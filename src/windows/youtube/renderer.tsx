import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import YoutubeVideo from "../../components/personas/YoutubeVideo";
import { QueryParamProvider } from "use-query-params";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(<QueryParamProvider><YoutubeVideo /></QueryParamProvider>, document.getElementById("root"));
