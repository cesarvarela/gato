import matchUrl from 'match-url-wildcard';
import { IParseResult, IPersona, PersonaName } from '../interfaces';
import isURL from 'validator/lib/isURL';
import Reader from './Reader';
import settings from './Settings'

const fixHTTP = href => href.startsWith('http')
    ? href
    : href.startsWith('localhost') ? `http://${href}` : `https://${href}`

class Web implements IPersona {

    readonly name: PersonaName = 'web'
    private reader: Reader
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

        const isSomeURL = isURL(q, { require_protocol: false, require_tld: false, require_port: false })

        if (isSomeURL) {

            const hasProtocol = isURL(q, { require_protocol: true, require_tld: false, require_port: false })
            const hasTLD = isURL(q, { require_protocol: false, require_tld: true, require_port: false })
            const hasPort = isURL(q, { require_protocol: false, require_tld: false, require_port: true })

            let href = q
            let confidence = 5

            if (await this.reader.isWhitelisted({ url: q })) {
                confidence++
            }

            if (hasProtocol) {
                confidence++
            }

            if (hasTLD) {
                confidence++
            }

            if (hasPort) {
                confidence++
            }

            href = fixHTTP(href)

            return { name: this.name, confidence, href }
        }

        return { name: this.name, confidence: 0, href: q }
    }

    async getOptions({ url }: { url: string }): Promise<{ trustCertificate: boolean }> {

        const list: any[] = settings.get('web.options')
        const result = list.find(option => matchUrl(url, option.url))

        if (result) {

            const { url: _, ...options } = result
            return options
        }

        return null
    }
}

export default Web
