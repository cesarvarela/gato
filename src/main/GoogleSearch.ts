import settings from "./settings"
import { google } from 'googleapis'
import electron from 'electron'
import secureListener from "../utils/secureHandle";
import { IParseResult, IPersona, PersonaName } from "../interfaces";
import isURL from "validator/lib/isURL";

const customsearch = google.customsearch('v1');

const cache = new Map<string, unknown>();

class GoogleSearch implements IPersona {

    name: PersonaName = 'search'

    static instance: GoogleSearch

    static async getInstance() {

        if (!GoogleSearch.instance) {
            GoogleSearch.instance = new GoogleSearch()
            await GoogleSearch.instance.init()
        }

        return GoogleSearch.instance
    }

    async init() {

        electron.ipcMain.handle('search', secureListener(async (e, { q }) => {

            const { data: { items } } = await this.search({ q })

            return items
        }))
    }

    async search({ q }) {

        const { googleSearch: { key, cx } } = settings.store

        if (!(q in cache)) {
            const result = await customsearch.cse.list({ key, cx, q })

            cache[q] = result
        }

        return cache[q]
    }

    async parse(q: string): Promise<IParseResult> {

        if (!isURL(q, { require_protocol: false })) {

            return { name: this.name, confidence: 7, params: { q } }
        }
        
        return { name: this.name, confidence: 0 }
    }
}

export default GoogleSearch