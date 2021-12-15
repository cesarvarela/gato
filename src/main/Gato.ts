import EventEmiter from 'events'
import electron from 'electron'
import isURL from "validator/es/lib/isURL";
import { IFind, IPaletteParams, IStatus, IStopFind } from '../interfaces';
import Windows from './Windows';
import contextMenu from 'electron-context-menu'

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const SNACKS_WEBPACK_ENTRY: string;
declare const SNACKS_PRELOAD_WEBPACK_ENTRY: string;

class Gato extends EventEmiter {

    window: electron.BrowserWindow = null
    paletteView: electron.BrowserView = null
    id: number
    contextMenuDispose: () => void

    static async create({ q }: { q?: string } = {}) {

        const instance = new Gato()
        await instance.init()

        if (q) {
            await instance.open({ q })
        }

        return instance
    }

    call({ params }: { params?: IPaletteParams } = {}) {

        this.paletteView.webContents.send('gato:call', { params });
    }

    show({ bounds }: { bounds: electron.Rectangle }) {

        this.paletteView.setBounds(bounds)
        this.paletteView.setAutoResize({ horizontal: true, vertical: true })

        this.paletteView.webContents.focus()
    }

    hide() {

        this.paletteView.setBounds({ x: 0, y: 0, width: 0, height: 0 })
        this.window.webContents.focus()
    }

    close() {
        this.window.close()
        this.contextMenuDispose()
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

    async choose({ q }: { q: string }) {

        let snack = null
        let params = {}

        if (isURL(q, { require_tld: true, require_protocol: false }) || isURL(q, { require_protocol: true, require_tld: false, require_port: true })) {

            let url = q

            if (!url.startsWith('http')) {

                url = `https://${url}`
            }

            const parsed = new URL(url)

            if (parsed.host.includes('youtube')) {

                const matches = url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)

                snack = 'youtubeVideo'
                params = { v: matches[5] }
            }
            else if (parsed.host.includes('localhost')) {

                snack = null
                params = { url }
            }
            else {

                snack = 'read'
                params = { url }
            }
        }
        else if (q.startsWith(':')) {

            snack = 'find'
            params = { q }
        }
        else {

            snack = 'search'
            params = { q }
        }

        return { snack, params }
    }

    async open({ q, snack, params = {} }: { q?: string, snack?: string, params?: Record<string, unknown> }) {

        if (q) {

            const { snack: chosenSnack, params: chosenParams } = await this.choose({ q })

            snack = chosenSnack
            params = chosenParams
        }

        let href = null

        switch (snack) {

            case 'home': {

                href = `${SNACKS_WEBPACK_ENTRY}?snack=home`
            }
                break;

            case 'search': {
                const { q } = params

                href = `${SNACKS_WEBPACK_ENTRY}?snack=search&q=${q}`
            }
                break;

            case 'read': {

                const { url } = params

                href = `${SNACKS_WEBPACK_ENTRY}?snack=read&url=${url}`
            }
                break;

            case 'youtubeVideo': {
                const { v } = params

                href = `${SNACKS_WEBPACK_ENTRY}?snack=youtubeVideo&v=${v}`
            }
                break;

            default: {
                const { url } = params

                href = url
            }
        }


        if (params.target == "_blank") {

            console.log('loading', params.target, href)

            const gato = await (await Windows.getInstance()).newWindow()

            gato.open({ snack, params: { ...params, target: '_self' } })
        } else {

            console.log('loading', params.target, href)

            this.window.loadURL(href)
            this.window.webContents.focus()
        }

        this.hide()
    }

    async status(): Promise<IStatus> {

        const response = {
            url: {
                href: this.window.webContents.getURL()
            },
            bounds: this.window.getBounds(),
        }

        return response
    }

    async createWindow() {

        // Create the browser window.
        this.window = new electron.BrowserWindow({
            webPreferences: {
                preload: SNACKS_PRELOAD_WEBPACK_ENTRY,
                spellcheck: true,
            }
        });

        this.contextMenuDispose = contextMenu({
            window: this.window,
            showSearchWithGoogle: false,
            prepend: (defaultActions, parameters, browserWindow) => [
                {
                    label: 'Search for “{selection}”',
                    visible: parameters.selectionText.trim().length > 0,
                    click: () => {
                        this.open({ q: parameters.selectionText })
                    }
                }
            ]
        })

        this.window.webContents.setVisualZoomLevelLimits(1, 4);

        this.window.loadURL(SNACKS_WEBPACK_ENTRY)

        this.paletteView = new electron.BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: this.window.getBounds().height })
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

        this.window.webContents.on('will-redirect', function (e, reqUrl) {

            console.log('will-redirect', reqUrl)

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
                            // "default-src 'unsafe-inline' 'self' 'unsafe-eval' blob: data: *.sentry.io *.cloudfront.net *.youtube.com *.google.com *.ytimg.com *.ggpht.com *.googlevideo.com",
                            "*"
                        ].join(';')
                    ]
                }
            })
        });

        this.window.webContents.session.webRequest.onBeforeRequest({
            urls: ['*://*.youtube.com/watch*']
        }, (details, cb) => {

            console.log('youtube', details)

            // cb({redirectURL: 'https://example.com'})
        })

        this.window.webContents.on('found-in-page', (event, result) => {

            // console.log('we', event, result)

            // if (result.finalUpdate) {

            //     this.window.webContents.stopFindInPage('clearSelection')
            // }
        })

        this.window.webContents.setWindowOpenHandler(({ url }) => {

            (async () => (await Windows.getInstance()).newWindow({ q: url }))()

            return { action: 'deny' }
        })
    }

    async find({ text, forward = true, findNext = false, matchCase = false }: IFind) {

        console.log('find', text, forward, findNext, matchCase,)

        return this.window.webContents.findInPage(text, {
            forward,
            matchCase,
            findNext
        })
    }

    async stopFind({ action }: IStopFind) {

        this.window.webContents.stopFindInPage(action)
    }

    async init() {

        await this.createWindow()

        this.id = this.window.id
    }

}

export default Gato