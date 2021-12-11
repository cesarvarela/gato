import "./index.css"
import React from "react";
import ReactDOM from "react-dom";
import App from '../../components/App';
import { IGato } from "../../interfaces";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
