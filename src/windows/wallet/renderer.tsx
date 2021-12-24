import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import { QueryParamProvider } from "use-query-params";
import Wallet from "../../components/wallet/Wallet";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <QueryParamProvider>
        <Wallet />
    </QueryParamProvider>
    , document.getElementById("root"));
