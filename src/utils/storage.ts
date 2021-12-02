import jsonStorage from 'electron-json-storage'

export default {

    has: async (key: string) => {

        return new Promise((resolve, reject) => {

            jsonStorage.has(key, (error, hasKey) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(hasKey)
                }
            })
        })
    },

    get: async (key: string): Promise<any> => {

        return new Promise((resolve, reject) => {

            jsonStorage.get(key, (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(data)
                }
            })
        })
    },

    set: async (key: string, value: any): Promise<any> => {
        return new Promise((resolve, reject) => {

            jsonStorage.set(key, value, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(value)
                }
            })
        })
    }
}