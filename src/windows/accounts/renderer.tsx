import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import AccountsPage from "../../components/settings/AccountsPage";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <AccountsPage />
    , document.getElementById("root")); 