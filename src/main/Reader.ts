import Mercury from '@postlight/mercury-parser';
import { IReader } from '../interfaces';
import { handleApi } from '../utils/bridge';
import settings from './settings';
import matchUrl from 'match-url-wildcard'

class Reader {
    api: IReader

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

        this.api = {
            read: async ({ url }) => {

                const result = await Mercury.parse(url)
                return result
            },
        }

        handleApi('reader', this.api)
    }

    async isWhitelisted({ url }) {

        const list: string[] = settings.get('reader.whitelist')

        return list.some(pattern => matchUrl(url, pattern))
    }
}

export default Reader
