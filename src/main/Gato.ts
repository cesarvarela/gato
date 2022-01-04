import electron from 'electron'
import { IGatoWindow, IPersona, IStatus, IParseResult, IWindows, PaletteMode } from '../interfaces';
import contextMenu from 'electron-context-menu'
import { handleApi, listen } from '../utils/bridge';
import Menu from './Menu';
import Reader from './Reader';
import Youtube from './Youtube';
import GoogleSearch from './GoogleSearch';
import Find from './Find';
import WhatsApp from './WhatsApp';
import Web from './Web';
import getPort from 'get-port';
import { merge } from 'lodash';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

declare const HOME_WEBPACK_ENTRY: string;
declare const SEARCH_WEBPACK_ENTRY: string;
declare const READ_WEBPACK_ENTRY: string;
declare const YOUTUBE_WEBPACK_ENTRY: string;
declare const WALLET_WEBPACK_ENTRY: string;
declare const ERROR_WEBPACK_ENTRY: string;

const map = {
    search: SEARCH_WEBPACK_ENTRY,
    home: HOME_WEBPACK_ENTRY,
    read: READ_WEBPACK_ENTRY,
    youtube: YOUTUBE_WEBPACK_ENTRY,
    wallet: WALLET_WEBPACK_ENTRY,
    error: ERROR_WEBPACK_ENTRY,
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

    static gatos: Record<string, Gato> = {}

    static async setup() {

        const menu = await Menu.getInstance()

        listen<IWindows>(menu, {
            close: async ({ window }) => {

                gatos[window.id].close()
            },
            new: async ({ params: { windowOptions } }) => {

                await Gato.create({ q: 'gato://home', windowOptions })
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

                gatos[window.id].call({ params: { mode: 'compact' } })
            },
            find: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'find' } })
            },
            hide: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'hidden' } })
            },
            location: async ({ window }) => {

                gatos[window.id].call({ params: { mode: 'location' } })
            },
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
            parse: async (params, e) => {
                const window = electron.BrowserWindow.fromWebContents(e.sender)

                return gatos[window.id].parse(params)
            }
        })

        const port = await getPort()

        electron.protocol.registerHttpProtocol('gato', (req, cb) => {

            try {

                const asked = new URL(req.url)
                const base = new URL(map[asked.host])
                const pathname = asked.pathname == '/' ? `/${asked.host}` : asked.pathname

                let url = null

                if (electron.app.isPackaged) {

                    url = 'http://127.0.0.1:' + port + pathname + asked.search
                }
                else {

                    url = base.origin + pathname + asked.search
                }

                cb({ url })
            }
            catch (e) {

                cb({ url: req.url })
            }
        })

        if (electron.app.isPackaged) {

            const express = require('express')
            const app = express()
            const path = require('path')

            app.use('/', express.static(path.join(electron.app.getAppPath(), '.webpack', 'renderer')))

            app.listen(port)
        }

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

    static async create({ q, windowOptions }: { q: string, windowOptions?: electron.BrowserWindowConstructorOptions }) {

        const gato = new Gato()
        await gato.init({ windowOptions })
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

    call({ params }: { params?: { mode: PaletteMode } } = {}) {

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

    close(e?: electron.Event) {

        this.window.removeBrowserView(this.paletteView)
        this.paletteView.webContents.closeDevTools()
        //TODO: using destroy instead of close prevents onbeforeunload to fire
        { (this.paletteView.webContents as any).destroy() }

        this.contextMenuDispose()
        this.window.webContents.removeAllListeners()
        this.window.webContents.closeDevTools()
        this.window.destroy()

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

        const results = await this.parse({ q })

        return results[0]
    }

    async parse({ q }: { q: string }): Promise<IParseResult[]> {

        const results = await Promise.all(personas.map(async (persona) => persona.parse(q)))
        const filtered = results.filter(suggestion => !!suggestion)
        const sorted = filtered.sort((a, b) => b.confidence - a.confidence)

        return sorted
    }

    async open({ href, params = {} }: IParseResult) {

        if (params.target == "_blank") {

            const gato = await Gato.create({ q: href })

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

    async init({ windowOptions }) {

        const defaults: electron.BrowserWindowConstructorOptions = {
            webPreferences: {
                preload: PERSONA_SHARED_PRELOAD_WEBPACK_ENTRY,
                spellcheck: true,
                sandbox: true,
                webviewTag: true,
            },
            backgroundColor: '#1C1C1C',
        }

        const options = merge({}, defaults, windowOptions)

        this.window = new electron.BrowserWindow(options)

        this.id = this.window.id

        this.contextMenuDispose = contextMenu({
            window: this.window,
            showSearchWithGoogle: false,
            showInspectElement: true,
            showCopyImage: true,
            showCopyImageAddress: true,
            showSaveImageAs: true,
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

        const web = await Web.getInstance()

        this.window.webContents.setWindowOpenHandler((details) => {

            const { url, features } = details

            if (features) { // asume a popup

                const options = web.getOptions({ url })

                if (options && options.allowPopups) {
                    return {
                        action: 'allow',
                        overrideBrowserWindowOptions: {
                            fullscreenable: false,
                        }
                    }
                }
            }
            else {

                Gato.create({ q: url })

                return { action: 'deny' }
            }
        })

        this.window.on('close', (e) => {

            this.close(e)
        });

        function insert(errorCode, errorDescription) {

            const content = `
                <div style="color:#fff;">${errorCode}</div>
                <div style="color:#fff;">${errorDescription}</div>
            `

            document.getElementsByTagName('body')[0].innerHTML = content;
        }

        this.window.webContents.on('did-fail-load', (event: Electron.Event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean) => {

            if (errorCode && errorCode !== -3 && isMainFrame && validatedURL) {

                this.window.webContents.executeJavaScript(` 

                    (${String(insert)})('${errorCode}', '${errorDescription}')
                `)
            }
        })

        this.window.webContents.on('did-navigate', async (e, url) => {

            const options = web.getOptions({ url })

            if (options && options.customCSS) {

                this.window.webContents.insertCSS(options.customCSS)
            }
        })

        this.window.webContents.on('page-title-updated', (e) => {

            if (!this.window.getTitle().startsWith('loading')) {

                const title = `${this.window.webContents.getURL()}`
                this.window.setTitle(title)
            }
        })

        this.window.webContents.on('did-start-loading', async () => {

            this.window.setTitle(`loading: ${this.window.title}`)
        })

        this.window.webContents.on('did-finish-load', (params) => {

            this.window.setTitle(this.window.title.replace('loading:', ''))
        })

        this.window.webContents.on('certificate-error', async (e, url, error, certificate, callback) => {

            const options: any = web.getOptions({ url })

            if (options && options.trustCertificate) {

                callback(true)
            }
        })
    }
}

export default Gato