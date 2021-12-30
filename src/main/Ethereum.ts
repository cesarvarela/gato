import { Wallet as EthersWallet, providers } from "ethers";
import { handleApi } from "../utils/bridge";

class Ethereum {

    static instance: Ethereum

    static async getInstance() {

        if (!Ethereum.instance) {
            Ethereum.instance = new Ethereum()

            await Ethereum.instance.init()
        }

        return Ethereum.instance
    }

    api: providers.ExternalProvider

    async init() {

        this.api = {
            
            host: 'wat',
            isMetaMask: true,
            isStatus: true,
            path: '',

            request: async (...args) => {
                console.log(args)
            },
            send: (...args) => {

                console.log('we')
            },
            sendAsync: async (...args) => {

                console.log(args)
            }
        }

        handleApi('ethereum', this.api)
    }
}

export default Ethereum