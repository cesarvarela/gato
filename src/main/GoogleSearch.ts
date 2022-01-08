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
            query: async ({ q }) => {

                if (!(q in cache)) {
                    const { data: { items } } = await this.search({ q })

                    cache[q] = items
                }

                return cache[q]
            }
        }

        handleApi('search', this.api)
    }

    async search({ q }) {

        const { googleSearch: { key, cx } } = settings.store

        if (!(q in cache)) {
            const result = await customsearch.cse.list({ key, cx, q })

            cache[q] = result
        }

        return cache[q]
    }

    async parse(q: string): Promise<IParseResult[]> {

        if (!q) {

            return null
        }

        if (!isURL(q, { require_protocol: false })) {

            return [{ name: this.name, confidence: 6, href: `gato://search?q=${q}` }]
        }
        else {

            return [{ name: this.name, confidence: 1, href: `gato://search?q=${q}` }]
        }
    }
}

export default GoogleSearch