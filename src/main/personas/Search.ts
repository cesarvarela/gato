import settings from "../Settings"
import { Confidence, IParseResult, IPersona, PersonaName } from "../../interfaces";
import isURL from "validator/lib/isURL";

class Search implements IPersona {

    name: PersonaName = 'search'

    static instance: Search

    static async getInstance() {

        if (!Search.instance) {
            Search.instance = new Search()
        }

        return Search.instance
    }

    async parse(q: string): Promise<IParseResult[]> {

        if (!q) {

            return null
        }

        let confidence = Confidence.Low

        const { search: { baseUrl } } = settings.store

        if (!isURL(q, { require_protocol: false })) {

            const whiteSpaces = q.split(' ')

            confidence = whiteSpaces.length > 3 ? Confidence.High : Confidence.Medium

            return [{ name: this.name, confidence, href: `${baseUrl}${q}`, q }]
        }
        else {

            return [{ name: this.name, confidence, href: `${baseUrl}${q}`, q }]
        }
    }
}

export default Search