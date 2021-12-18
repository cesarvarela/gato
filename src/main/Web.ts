import { IParseResult, IPersona, PersonaName } from '../interfaces';
import settings from './settings';
import matchUrl from 'match-url-wildcard'
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

        if (isURL(q, { require_protocol: false })) {

            const whitelisted = await this.reader.isWhitelisted({ url: q })

            return { name: this.name, confidence: whitelisted ? 7 : 5, href: q }
        }
    }
}

export default Web
