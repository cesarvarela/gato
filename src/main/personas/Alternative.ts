import { Confidence, IParseResult, IPersona, PersonaName } from '../../interfaces';
import settings from '../Settings'

const fixHTTP = href => href.startsWith('http')
    ? href
    : href.startsWith('localhost') ? `http://${href}` : `https://${href}`

class Alternative implements IPersona {

    readonly name: PersonaName = 'alternative'
    static instance: Alternative

    static async getInstance() {

        if (!Alternative.instance) {
            const instance = new Alternative()
            Alternative.instance = instance
        }

        return Alternative.instance
    }

    async parse(q: string): Promise<IParseResult[]> {

        const mappings: any[] = settings.get('alternative.mappings')

        if (!q) {
            return null
        }

        const matches = []

        for (const mapping of mappings) {

            if (q.match(mapping.from)) {

                const href = fixHTTP(q.replace(mapping.from, mapping.to))

                matches.push({ name: this.name, confidence: Confidence.VeryHigh, href })
            }
        }

        return matches
    }
}

export default Alternative
