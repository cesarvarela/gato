import electron from 'electron'
import { IGatoWindow, IPersona, IStatus, IParseResult, IWindows } from '../interfaces';
import contextMenu from 'electron-context-menu'
import { handleApi, listen } from '../utils/bridge';
import Menu from './Menu';
import Reader from './Reader';
import Youtube from './Youtube';
import GoogleSearch from './GoogleSearch';
import Find from './Find';
import WhatsApp from './WhatsApp';
import Web from './Web';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const HOME_WEBPACK_ENTRY: string;
declare const SEARCH_WEBPACK_ENTRY: string;
declare const READ_WEBPACK_ENTRY: string;
declare const YOUTUBE_WEBPACK_ENTRY: string;

const map = {
    search: SEARCH_WEBPACK_ENTRY,
    home: HOME_WEBPACK_ENTRY,
    read: READ_WEBPACK_ENTRY,
    youtube: YOUTUBE_WEBPACK_ENTRY,
}

declare const PERSONA_SHARED_PRELOAD_WEBPACK_ENTRY: string

const gatos: Gato[] = []

const personas: IPersona[] = []

class Gato {

    window: electron.BrowserWindow = null
    paletteView: electron.BrowserView = null
    id: number
    contextMenuDispose: () => void

    static personas: IPersona[] = []

    static gatos: Record<number, Gato> = {}

    static async setup() {

        const menu = await Menu.getInstance()

        listen<IWindows>(menu, {
            close: async ({ window }) => {

                gatos[window.id].close()
            },
            new: async () => {

                await Gato.create({ q: 'gato://home' })
            },
            back: async ({ window }) => {

                gatos[window.id].back()
            },
            forward: async ({ window }) => {

                gatos[window.id].forward()
            },
            openDevTools: async ({ window }) => {

                gatos[window.id].openDevTools()
            },
            reload: async ({ window }) => {
                gatos[window.id].reload()
            },
            show: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'show' } })
            },
            find: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'find' } })
            },
            hide: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'hide' } })
            },
            location: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'location' } })
            }
        })

        handleApi<IGatoWindow>('gato', {

            open: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                gatos[window.id].open(params)
            },
            hide: async (e) => {
                const window = electron.BrowserWindow.fromWebContents(e.sender)

                gatos[window.id].hide()
            },
            show: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                gatos[window.id].show(params)
            },
            choose: async (params, e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return gatos[window.id].choose(params)
            },
            status: async (e) => {

                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return gatos[window.id].status()
            },
        })

        electron.protocol.registerHttpProtocol('gato', (req, cb) => {

            try {

                const asked = new URL(req.url)
                const base = new URL(map[asked.host])
                const pathname = asked.pathname == '/' ? `/${asked.host}` : asked.pathname

                const url = base.origin + pathname + asked.search

                cb({ url })
            }
            catch (e) {
                console.log(e, req.url)

                cb({ url: req.url })
            }
        })

        const youtube = await Youtube.getInstance()
        const reader = await Reader.getInstance()
        const search = await GoogleSearch.getInstance()
        const find = await Find.getInstance()
        const whatsapp = await WhatsApp.getInstance()
        const web = await Web.getInstance()

        personas.push(youtube)
        personas.push(reader)
        personas.push(search)
        personas.push(find)
        personas.push(whatsapp)
        personas.push(web)
    }

    static async create({ q = 'gato://home' }: { q?: string } = {}) {

        const gato = new Gato()
        await gato.init()

        gatos[gato.id] = gato

        if (q) {
            const result = await gato.choose({ q })
            await gato.open(result)
        }

        return gato
    }

    static getFocused() {

        return gatos[electron.BrowserWindow.getFocusedWindow().id]
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

        //TODO: check that we are cleaning up everything

        this.window.removeBrowserView(this.paletteView)
        this.paletteView.webContents.closeDevTools()

        this.window.webContents.removeAllListeners()
        this.window.close()

        this.contextMenuDispose()

        this.window = null
        this.paletteView = null
        gatos[this.id] = null
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

    async choose({ q }: { q: string }): Promise<IParseResult> {

        if (q.startsWith('gato://')) {

            return { href: q, confidence: 10 }
        }

        const results = await Promise.all(personas.map(async (persona) => persona.parse(q)))

        const sorted = results.sort((a, b) => b.confidence - a.confidence)

        const result = { name: sorted[0].name, ...sorted[0] }

        return result
    }

    async open({ href, params = {} }: IParseResult) {

        if (params.target == "_blank") {

            const gato = await Gato.create()
            gato.open({ href, params: { ...params, target: '_self' } })

        } else {

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

        this.window = new electron.BrowserWindow({
            webPreferences: {
                preload: PERSONA_SHARED_PRELOAD_WEBPACK_ENTRY,
                spellcheck: true,
                // sandbox: true,
            }
        });

        this.contextMenuDispose = contextMenu({
            window: this.window,
            showSearchWithGoogle: false,
            prepend: (defaultActions, parameters) => [
                {
                    label: 'Search for “{selection}”',
                    visible: parameters.selectionText.trim().length > 0,
                    click: async () => {

                        const result = await this.choose({ q: parameters.selectionText })
                        this.open(result)
                    }
                }
            ]
        })

        this.window.webContents.setVisualZoomLevelLimits(1, 4);

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
                            // TODO: fix this
                            // "default-src 'unsafe-inline' 'self' 'unsafe-eval' blob: data: *.sentry.io *.cloudfront.net *.youtube.com *.google.com *.ytimg.com *.ggpht.com *.googlevideo.com",
                            "default-src * 'unsafe-eval' 'unsafe-inline' ws: data:"
                        ].join(';')
                    ]
                }
            })
        });

        this.window.webContents.setWindowOpenHandler(({ url }) => {

            Gato.create({ q: url })

            return { action: 'deny' }
        })

        this.window.once('close', (e) => {

            e.preventDefault();
            this.close()
        });
    }

    async init() {

        await this.createWindow()

        this.id = this.window.id

        this.window.webContents.on('did-start-loading', (params) => {

            const title = `loading: ${this.window.webContents.getURL()}`
            this.window.setTitle(title)
        })

        this.window.webContents.on('did-finish-load', (params) => {

            const title = `${this.window.webContents.getURL()}`
            this.window.setTitle(title)
        })
    }

}

export default Gato