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

        items.unshift(href)
        const updated = items.slice(0, 27)

        settings.set("history.items", updated)
    }
}

export default History