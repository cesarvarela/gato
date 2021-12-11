import { JSDOM } from 'jsdom';
import electron from 'electron'
import got from 'got';
import { isProbablyReaderable, Readability } from '@mozilla/readability';

class Reader {

    static async create() {
        const instance = new Reader()
        instance.init()

        return instance
    }

    async init() {

        electron.ipcMain.handle('read', async (e, { url }) => {

            const response = await got(url)
            const page = new JSDOM(response.body, { url });

            if (isProbablyReaderable(page.window.document)) {

                const reader = new Readability(page.window.document);
                const article = reader.parse();

                return { content: article.content }
            }

            throw 'Not readerable'
        })
    }
}

export default Reader