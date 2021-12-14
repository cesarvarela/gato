import storage from '../utils/storage'
import merge from 'lodash/merge';

interface ISettings {

    googleSearch: {
        key: string,
        cx: string,
    }

    reader: {
        blacklist: string[],
    }
}

const defaults: ISettings = {

    googleSearch: {
        key: '',
        cx: '',
    },
    
    reader: {
        blacklist: [],
    }
}

class Settings {

    private readonly key = "settings"

    async set(value: Partial<ISettings>): Promise<ISettings> {

        //TODO this may be backwatds :)
        const stored = merge({}, value, defaults)

        return storage.set(this.key, stored)
    }

    async get(): Promise<ISettings> {

        const stored = await storage.get(this.key)
        const value = merge({}, defaults, stored,)

        return value
    }
}

export default Settings