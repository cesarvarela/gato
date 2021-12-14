import Mercury from '@postlight/mercury-parser';
import { IReader } from '../interfaces';
import Settings from './Settings';
import { handleApi } from '../utils/bridge';

class Reader {
    api: IReader
    settings = new Settings()

    static instance: Reader

    static async getInstance() {

        if (!Reader.instance) {
            const instance = new Reader()
            await instance.init()
            Reader.instance = instance
        }

        return Reader.instance
    }

    async init() {

        const { reader: { blacklist } } = await this.settings.get()

        this.api = {
            read: async ({ url }) => {

                const result = await Mercury.parse(url)
                
                return result
            },
            blacklist: async ({ url }) => {
                console.log('blacklist', url)
                return Promise.resolve(true)
            },
            whitelist: async ({ url }) => {
                console.log('whitelist', url)
                return Promise.resolve(true)
            }
        }

        handleApi('reader', this.api)
    }
}

export default Reader
