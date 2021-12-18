import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import Home from "../../components/personas/Home";

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(<Home />, document.getElementById("root"));
