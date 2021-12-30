import { createWallet } from '../keyring'

class Wallet {

    static instance: Wallet

    static async getInstance() {

        if (!Wallet.instance) {
            Wallet.instance = new Wallet()

            await Wallet.instance.init()
        }

        return Wallet.instance
    }

    async init() {

    }
}

export default Wallet