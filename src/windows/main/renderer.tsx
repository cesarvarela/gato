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

window.onkeydown = function (evt) {
    console.log('Zoom shorcut disabled')
    if ((evt.code == "Minus" || evt.code == "Equal") && (evt.ctrlKey || evt.metaKey)) { evt.preventDefault() }
}

ReactDOM.render(<App />, document.getElementById("root"));
