import electron from 'electron'
import Mercury from '@postlight/mercury-parser';

class Reader {

    static async create() {
        const instance = new Reader()
        instance.init()

        return instance
    }

    async init() {

        electron.ipcMain.handle('read', async (e, { url }) => {

            const result = await Mercury.parse(url)

            return result
        })
    }
}

export default Reader