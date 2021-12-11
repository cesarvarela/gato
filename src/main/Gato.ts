import EventEmiter from 'events'
import electron from 'electron'
import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom'
import got from 'got'

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const HOME_WEBPACK_ENTRY: string;
declare const HOME_PRELOAD_WEBPACK_ENTRY: string;

declare const SEARCH_WEBPACK_ENTRY: string;

class Gato extends EventEmiter {

    window: electron.BrowserWindow = null
    snackView: electron.BrowserView = null
    paletteView: electron.BrowserView = null
    id: number

    static async create() {

        const instance = new Gato()
        await instance.init()

        return instance
    }

    show() {

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
    }

    hide() {

        this.paletteView.setBounds({ x: 0, y: 0, width: 0, height: 0 })
        // this.window.webContents.focus()
    }

    close() {

        this.window.close()
    }

    canGoBack() {
        return this.window.webContents.canGoBack()
    }

    back() {
        this.window.webContents.goBack()
    }

    canGoForward() {
        return this.window.webContents.canGoForward()
    }

    forward() {
        this.window.webContents.goForward()
    }

    reload() {

        this.window.webContents.reload()
    }

    openDevTools() {

        this.window.webContents.openDevTools()

        this.snackView.webContents.openDevTools()
        this.paletteView.webContents.openDevTools()
    }

    async open({ snack = 'reader', params = {} }: { snack: string, params: Record<string, unknown> }) {

        let target = null

        switch (snack) {

            case 'search': {
                const { q } = params

                target = `${SEARCH_WEBPACK_ENTRY}?q=${q}`
            }
                break;

            case 'reader':
            default: {
                const { url } = params

                const response = await got(url)
                const page = new JSDOM(response.body, { url });

                if (isProbablyReaderable(page.window.document)) {

                    isProbablyReaderable(page.window.document)

                    const reader = new Readability(page.window.document);
                    const article = reader.parse();

                    target = `data:text/html,${encodeURIComponent(article.content)}`
                }
                else {

                    target = url
                }
            }
        }

        console.log('loading', target)

        this.window.loadURL(target)
        this.window.webContents.focus()
        this.hide()
    }

    async createWindow() {

        // Create the browser window.
        this.window = new electron.BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                preload: HOME_PRELOAD_WEBPACK_ENTRY,
            }
        });

        this.window.loadURL(HOME_WEBPACK_ENTRY)

        this.snackView = new electron.BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })

        this.snackView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
        this.snackView.setAutoResize({ horizontal: true, vertical: true })
        this.snackView.webContents.loadURL(MAIN_WEBPACK_ENTRY)

        this.window.addBrowserView(this.snackView)

        this.paletteView = new electron.BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
        this.paletteView.setAutoResize({ horizontal: true, vertical: true })
        this.paletteView.webContents.loadURL(MAIN_WEBPACK_ENTRY)

        this.window.addBrowserView(this.paletteView)
    }

    async init() {

        await this.createWindow()

        this.id = this.window.id
    }

}

export default Gato