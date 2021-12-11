import EventEmiter from 'events'
import electron from 'electron'

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const SNACKS_WEBPACK_ENTRY: string;
declare const SNACKS_PRELOAD_WEBPACK_ENTRY: string;

class Gato extends EventEmiter {

    window: electron.BrowserWindow = null
    paletteView: electron.BrowserView = null
    id: number

    static async create() {

        const instance = new Gato()
        await instance.init()

        return instance
    }

    show() {

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
        this.paletteView.webContents.focus()
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

        this.paletteView.webContents.openDevTools()
    }

    async open({ snack, params = {} }: { snack: string, params?: Record<string, unknown> }) {

        let target = null

        switch (snack) {

            case 'home': {

                target = `${SNACKS_WEBPACK_ENTRY}?snack=home`
            }
                break;

            case 'search': {
                const { q } = params

                target = `${SNACKS_WEBPACK_ENTRY}?snack=search&q=${q}`
            }
                break;

            case 'read': {

                const { url } = params

                target = `${SNACKS_WEBPACK_ENTRY}?snack=read&url=${url}`
            }
                break;

            case 'youtubeVideo': {
                const { v } = params

                target = `${SNACKS_WEBPACK_ENTRY}?snack=youtubeVideo&v=${v}`
            }
                break;

            default: {
                const { url } = params

                target = url
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
                preload: SNACKS_PRELOAD_WEBPACK_ENTRY,
            }
        });

        this.window.loadURL(SNACKS_WEBPACK_ENTRY)

        this.paletteView = new electron.BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
        this.paletteView.setAutoResize({ horizontal: true, vertical: true })
        this.paletteView.webContents.loadURL(MAIN_WEBPACK_ENTRY)

        this.window.addBrowserView(this.paletteView)

        this.window.webContents.on('will-navigate', function (e, reqUrl) {

            console.log('will-navigate', reqUrl)

            // let getHost = url=>require('url').parse(url).host;
            // let reqHost = getHost(reqUrl);
            // let isExternal = reqHost && reqHost !== getHost(wc.getURL());
            // if(isExternal) {
            //   e.preventDefault();
            //   shell.openExternal(reqUrl, {});
            // }
        })

        this.window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        [
                            "default-src 'unsafe-inline' 'self' 'unsafe-eval' blob: data: *.sentry.io *.cloudfront.net *.youtube.com *.google.com *.ytimg.com *.ggpht.com *.googlevideo.com",
                        ].join(';')
                    ]
                }
            })
        });

    }

    async init() {

        await this.createWindow()

        this.id = this.window.id
    }

}

export default Gato