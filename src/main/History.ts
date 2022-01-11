import { IParseResult, IPersona, PersonaName } from "../interfaces"
import settings from "./Settings"
import Fuse from 'fuse.js'
import { uniqBy } from "lodash"

class History implements IPersona {

    static instance: History

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
            const updated = items.slice(0, 100)

            settings.set("history.items", updated)
        }
    }

    async getLast(): Promise<Partial<IParseResult>> {

        const items: string[] = settings.get("history.items")

        return { href: items[0] }
    }

    async parse(q: string): Promise<IParseResult[]> {

        const items: string[] = settings.get("history.items")
        const fuse = new Fuse([...new Set(items)], { includeScore: true, keys: ['href'], threshold: 0.3, ignoreLocation: true, })
        let confidence = 9

        const historyResults = fuse
            .search(q)
            .slice(0, 3)
            .map(({ item, score }) => ({ name: this.name, confidence: confidence - score * confidence, href: item }))

        const bookmarks: string[] = settings.get("history.bookmarks")

        confidence = 10

        fuse.setCollection([...new Set(bookmarks)])

        const bookmarksResults = fuse
            .search(q)
            .slice(0, 3)
            .map(({ item, score }) => ({ name: this.name, confidence: confidence - score * confidence, href: item }))

        const results = uniqBy([...bookmarksResults, ...historyResults], 'href')

        return results
    }
}

export default History