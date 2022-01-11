import Mercury from '@postlight/mercury-parser';
import { IParseResult, IPersona, IReader, PersonaName } from '../interfaces';
import { handleApi } from '../utils/bridge';
import settings from './Settings';
import matchUrl from 'match-url-wildcard'
import isURL from 'validator/lib/isURL';

class Reader implements IPersona {

    api: IReader
    name: PersonaName = 'read'

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

    async parse(q: string): Promise<IParseResult[]> {

        if (isURL(q, { require_protocol: false }) && !(await this.isWhitelisted({ url: q }))) {

            return [{ name: this.name, confidence: 10, href: `gato://read?url=${encodeURI(q)}` }]
        }
    }
}

export default Reader
