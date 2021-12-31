import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Account from '../../components/wallet/Account';
import Layout from '../../components/wallet/Layout';

const WalletRouter = () => {

    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Account />} />
            </Route>
        </Routes>
    </BrowserRouter>
};

export default WalletRouter;
