import "../../styles/snack.css"
import React from "react";
import ReactDOM from "react-dom";
import { IGato } from "../../interfaces";
import { QueryParamProvider } from "use-query-params";
import WalletRouter from "./router";
import { store } from '../../components/wallet/store'
import { Provider } from 'react-redux'

declare global {
    interface Window {
        gato: IGato
    }
}

ReactDOM.render(
    <Provider store={store}>
        <QueryParamProvider>
            <WalletRouter />
        </QueryParamProvider>
    </Provider>
    , document.getElementById("root"));
