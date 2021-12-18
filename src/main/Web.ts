import { IParseResult, IPersona, PersonaName } from '../interfaces';
import isURL from 'validator/lib/isURL';
import Reader from './Reader';

class Web implements IPersona {

    name: PersonaName = 'web'
    reader: Reader

    static instance: Web

    static async getInstance() {

        if (!Web.instance) {
            const instance = new Web()
            await instance.init()
            Web.instance = instance
        }

        return Web.instance
    }

    async init() {
        this.reader = await Reader.getInstance()
    }

    async parse(q: string): Promise<IParseResult> {

        if (isURL(q, { require_protocol: false })
            || isURL(q, { require_tld: false, require_protocol: false, host_whitelist: ['localhost'] })
        ) {

            const whitelisted = await this.reader.isWhitelisted({ url: q })

            const href = q.startsWith('http')
                ? q
                : q.startsWith('localhost') ? `http://${q}` : `https://${q}`

            return { name: this.name, confidence: whitelisted ? 7 : 5, href }
        }
    }
}

export default Web
