import './index.css';
import "tailwindcss/tailwind.css"
import React from "react";
import ReactDOM from "react-dom";
import App from './components/App';

declare global {
    interface Window {
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
