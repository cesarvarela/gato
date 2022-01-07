import { IParseResult } from "../interfaces"
import settings from "./Settings"

class History {

    static instance: History

    static async getInstance() {

        if (!History.instance) {
            History.instance = new History()
        }

        return History.instance
    }

    async save({ href }: Partial<IParseResult>) {

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
}

export default History