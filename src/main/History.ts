import { IParseResult, IPersona, PersonaName } from "../interfaces"
import settings from "./Settings"
import Fuse from 'fuse.js'

interface IHistoryApi {

}

class History implements IPersona {

    static instance: History

    api: IHistoryApi
    name: PersonaName = 'history'

    static async getInstance() {

        if (!History.instance) {
            History.instance = new History()
        }

        return History.instance
    }

    async save({ href }: Partial<IParseResult>) {

        const bookmarks: string[] = settings.get("history.bookmarks")

        bookmarks.unshift(href)
        settings.set("history.bookmarks", bookmarks)
    }

    async add({ href }: Partial<IParseResult>) {

        const items: string[] = settings.get("history.items")

        if (href !== 'gato://home' && items[0] !== href) {

            items.unshift(href)
            const updated = items.slice(0, 27)

            settings.set("history.items", updated)
        }
    }

    async getLast(): Promise<Partial<IParseResult>> {

        const items: string[] = settings.get("history.items")

        return { href: items[0] }
    }

    async parse(q: string): Promise<IParseResult[]> {

        const items: string[] = settings.get("history.items")
        const fuse = new Fuse([...new Set(items)], { includeScore: true, keys: ['href'], threshold: 0.3, ignoreLocation: true })

        const result = fuse.search(q)

        return result
            .slice(0, 5)
            .map(({ item, score }) => ({ name: this.name, confidence: 10 - score * 10, href: item }))
    }
}

export default History