import electron from 'electron'
import isURL from "validator/es/lib/isURL";
import { IFind, IGatoWindow, IPersona, IStatus, IStopFind, IWindows, PersonaName } from '../interfaces';
import contextMenu from 'electron-context-menu'
import { handleApi, listen } from '../utils/bridge';
import Menu from './Menu';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const SNACKS_WEBPACK_ENTRY: string;
declare const SNACKS_PRELOAD_WEBPACK_ENTRY: string;

class Gato {

    window: electron.BrowserWindow = null
    paletteView: electron.BrowserView = null
    id: number
    contextMenuDispose: () => void

    static gatos: Record<number, Gato> = {}

    static async setup() {

        const menu = await Menu.getInstance()

        listen<IWindows>(menu, {
            close: async ({ window }) => {

                Gato.gatos[window.id].close()
                delete Gato.gatos[window.id]
            },
            new: async () => {

                await Gato.create()
            },
            back: async ({ window }) => {

                Gato.gatos[window.id].back()
            },
            forward: async ({ window }) => {

                Gato.gatos[window.id].forward()
            },
            openDevTools: async ({ window }) => {

                Gato.gatos[window.id].openDevTools()
            },
            reload: async ({ window }) => {
                Gato.gatos[window.id].reload()
            },
            show: async ({ window }) => {

                Gato.gatos[window.id].call({ params: { mode: 'show' } })
            },
            find: async ({ window }) => {

                Gato.gatos[window.id].call({ params: { mode: 'find' } })
            },
            hide: async ({ window }) => {

                Gato.gatos[window.id].call({ params: { mode: 'hide' } })
            },
            location: async ({ window }) => {

                Gato.gatos[window.id].call({ params: { mode: 'location' } })
            }
        })

        handleApi<IGatoWindow>('gato', {

            open: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                Gato.gatos[window.id].open(params)
            },
            hide: async (e) => {
                const window = electron.BrowserWindow.fromWebContents(e.sender)

                Gato.gatos[window.id].hide()
            },
            show: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                Gato.gatos[window.id].show(params)
            },
            choose: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return Gato.gatos[window.id].choose(params)
            },
            status: async (e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return Gato.gatos[window.id].status()
            },
            find: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return Gato.gatos[window.id].find(params)
            },
            stopFind: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return Gato.gatos[window.id].stopFind(params)
            }
        })
    }

    static async create({ q }: { q?: string } = {}) {

        const gato = new Gato()
        await gato.init()

        Gato.gatos[gato.id] = gato

        if (q) {
            await gato.open({ q })
        }

        return gato
    }

    call({ params }: { params?} = {}) {

        this.paletteView.webContents.send('gato:call', { params });
    }

    show({ bounds }: { bounds: electron.Rectangle }) {

        this.paletteView.setBounds(bounds)
        this.paletteView.webContents.focus()
    }

    hide() {

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: 0 })
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
        if (this.canGoBack()) {

            this.window.webContents.goBack()
        }
    }

    canGoForward() {
        return this.window.webContents.canGoForward()
    }

    forward() {
        if (this.canGoForward()) {
            this.window.webContents.goForward()
        }
    }

    reload() {

        this.window.webContents.reload()
    }

    openDevTools() {

        this.window.webContents.openDevTools()

        this.paletteView.webContents.openDevTools()
    }

    async choose({ q }: { q: string }): Promise<IPersona> {

        let snack: PersonaName = null
        let params = {}

        if (isURL(q, { require_tld: true, require_protocol: false }) || isURL(q, { require_protocol: true, require_tld: false, require_port: true })) {

            let url = q

            if (!url.startsWith('http')) {

                url = `https://${url}`
            }

            const parsed = new URL(url)

            if (parsed.host.includes('youtube')) {

                const matches = url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/)

                snack = 'youtube'
                params = { v: matches[5] }
            }
            else if (parsed.host.includes('localhost')) {

                snack = 'web'
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

            const gato = await Gato.create()

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
                sandbox: true,
            }
        });

        this.contextMenuDispose = contextMenu({
            window: this.window,
            showSearchWithGoogle: false,
            prepend: (defaultActions, parameters) => [
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

        this.paletteView.setBounds({ x: 0, y: 0, width: this.window.getBounds().width, height: 0 })
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

            Gato.create({ q: url })

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