import { IParseResult, IPersona, IYoutube, PersonaName } from "../interfaces";
import isURL from "validator/lib/isURL";
import { handleApi } from "../utils/bridge";
import settings from './Settings'
import { google } from 'googleapis';

const youtube = google.youtube('v3');

class Youtube implements IPersona {

    name: PersonaName = 'youtube'
    static instance: Youtube
    api: IYoutube

    static async getInstance() {

        if (!Youtube.instance) {

            Youtube.instance = new Youtube()
            await Youtube.instance.init()
            return Youtube.instance
        }
    }

    async init() {

        this.api = {
            getComments: async ({ v: videoId }) => {

                const { data: { items } } = await youtube.commentThreads.list({
                    part: [
                        "snippet,replies"
                    ],
                    order: "relevance",
                    videoId,
                    key: settings.store.youtube.key,
                })

                return items
            }
        }

        handleApi('youtube', this.api)
    }

    async parse(q): Promise<IParseResult> {

        if (isURL(q, { host_whitelist: ['youtube.com', 'www.youtube.com'], require_protocol: false })) {

            try {

                const parsed = new URL(q)

                if (parsed.searchParams.has('v')) {

                    return { name: this.name, confidence: 10, href: `gato://youtube?v=${parsed.searchParams.get('v')}` }
                }
            }
            catch (e) {

                return { name: this.name, confidence: 0, href: null }
            }
        }

        return { name: this.name, confidence: 0, href: null }
    }
}

export default Youtube