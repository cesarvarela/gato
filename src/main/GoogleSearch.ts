import Settings from "./Settings"
import { google } from 'googleapis'
import electron from 'electron'

const customsearch = google.customsearch('v1');

class GoogleSearch {

    private settings: Settings

    static async create() {
        const instance = new GoogleSearch()
        instance.init()

        return instance
    }

    async init() {

        this.settings = new Settings()

        electron.ipcMain.handle('search', async (e, { q }) => {

            const { data: { items } } = await this.search({ q })

            return items
        })
    }

    async search({ q }) {

        const { googleSearch: { key, cx } } = await this.settings.get()

        return customsearch.cse.list({ key, cx, q })
    }


}

export default GoogleSearch