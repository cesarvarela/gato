import { IParseResult, IPersona, PersonaName } from "../interfaces";
import isURL from "validator/lib/isURL";

class Youtube implements IPersona {

    name: PersonaName = 'youtube'

    static async getInstance() {
        const instance = new Youtube()

        return instance
    }

    async parse(q): Promise<IParseResult> {

        if (isURL(q, { host_whitelist: ['youtube.com', 'www.youtube.com'], require_protocol: false })) {

            try {

                const parsed = new URL(q)

                if (parsed.searchParams.has('v')) {

                    return { name: this.name, confidence: 10, params: { v: parsed.searchParams.get('v') } }
                }
            }
            catch (e) {

                return { name: this.name, confidence: 0 }
            }

        }

        return { name: this.name, confidence: 0 }
    }
}

export default Youtube