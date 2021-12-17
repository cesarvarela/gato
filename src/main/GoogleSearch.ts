import settings from "./settings"
import { google } from 'googleapis'
import electron from 'electron'
import secureListener from "../utils/secureHandle";

const customsearch = google.customsearch('v1');

const cache = new Map<string, unknown>();

class GoogleSearch {

    static async create() {
        const instance = new GoogleSearch()
        instance.init()

        return instance
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
}

export default GoogleSearch