import settings from "./Settings"
import { google } from 'googleapis'
import { IParseResult, IPersona, ISearch, PersonaName } from "../interfaces";
import isURL from "validator/lib/isURL";
import { handleApi } from "../utils/bridge";

const customsearch = google.customsearch('v1');

const cache = new Map<string, unknown>();

class GoogleSearch implements IPersona {

    name: PersonaName = 'search'
    api: ISearch

    static instance: GoogleSearch

    static async getInstance() {

        if (!GoogleSearch.instance) {
            GoogleSearch.instance = new GoogleSearch()
            await GoogleSearch.instance.init()
        }

        return GoogleSearch.instance
    }

    async init() {

        this.api = {
            query: async ({ q, start }) => {

                const { data: { items } } = await this.search({ q, start })

                return items
            }
        }

        handleApi('search', this.api)
    }

    async search({ q, start = 1 }: { q: string, start?: number }) {

        const { googleSearch: { key, cx } } = settings.store
        const cacheKey = `${q}:${start}`

        if (!(cacheKey in cache)) {
            const result = await customsearch.cse.list({ key, cx, q, start })

            cache[cacheKey] = result
        }

        return cache[cacheKey]
    }

    async parse(q: string): Promise<IParseResult[]> {

        if (!q) {

            return null
        }

        let confidence = 5

        if (!isURL(q, { require_protocol: false })) {

            const whiteSpaces = q.split(' ')

            confidence += Math.min(whiteSpaces.length, 3)

            return [{ name: this.name, confidence, href: `gato://search?q=${q}` }]
        }
        else {

            return [{ name: this.name, confidence, href: `gato://search?q=${q}` }]
        }
    }
}

export default GoogleSearch