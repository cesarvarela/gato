import Settings from "./Settings"
import { google } from 'googleapis'

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
    }

    async search({ q }) {

        const { googleSearch: { key, cx } } = await this.settings.get()

        return customsearch.cse.list({ key, cx, q })
    }


}

export default GoogleSearch