import electron from 'electron'
import { IGatoWindow, IPersona, IStatus, IParseResult, IWindows, PaletteMode } from '../interfaces';
import contextMenu from 'electron-context-menu'
import { handleApi, listen } from '../utils/bridge';
import Menu from './Menu';
import Reader from './personas/Reader';
import Youtube from './personas/Youtube';
import GoogleSearch from './personas/GoogleSearch';
import Find from './personas/Find';
import WhatsApp from './personas/WhatsApp';
import History from './personas/History';
import Web from './personas/Web';
import getPort from 'get-port';
import { merge } from 'lodash';
import TitleUpdater from './gato/TItleUpdater';

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

const closedHistory: string[] = []

class Gato {

    window: electron.BrowserWindow = null
    paletteView: electron.BrowserView = null
    id: number
    titleUpdater: TitleUpdater
    contextMenuDispose: () => void

    static personas: IPersona[] = []

    static async setup() {

        const menu = await Menu.getInstance()

        listen<IWindows>(menu, {
            close: async ({ window }) => {

                if (!window) {

                    const focused = electron.BrowserWindow.getFocusedWindow()

                    if (focused && gatos[focused.id]) {

                        gatos[focused.id].closeDevTools()
                    }
                }
                else if (gatos[window.id]) {

                    gatos[window.id].close()
                }
            },
            new: async ({ params: { windowOptions } }) => {

                await Gato.create({ q: 'gato://home', windowOptions })
            },
            reopen: async () => {

                Gato.reopen()
            },
            duplicate: async ({ window }) => {

                if (window) {
                    gatos[window.id].duplicate()
                }
            },
            back: async ({ window }) => {

                if (window) {

                    gatos[window.id].back()
                }
            },
            forward: async ({ window }) => {

                if (window) {

                    gatos[window.id].forward()
                }
            },
            openDevTools: async ({ window }) => {

                if (window) {

                    gatos[window.id].openDevTools()
                }
            },
            reload: async ({ window }) => {

                if (window) {

                    gatos[window.id].reload()
                }
            },
            show: async ({ window }) => {

                if (window) {

                    gatos[window.id].call({ params: { mode: 'compact' } })
                }
            },
            find: async ({ window }) => {

                if (window) {

                    gatos[window.id].call({ params: { mode: 'find' } })
                }
            },
            hide: async ({ window }) => {

                if (window) {

                    gatos[window.id].call({ params: { mode: 'hidden' } })
                    gatos[window.id].stop()
                }
            },
            location: async ({ window }) => {

                if (window) {

                    gatos[window.id].call({ params: { mode: 'location' } })
                }
            },

            bookmark: async ({ window }) => {

                if (window) {

                    gatos[window.id].bookmark()
                }
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

        const whatsapp = await WhatsApp.getInstance()
        const find = await Find.getInstance()
        const web = await Web.getInstance()
        const search = await GoogleSearch.getInstance()
        const history = await History.getInstance()
        const reader = await Reader.getInstance()
        const youtube = await Youtube.getInstance()

        // order of results if same score
        personas.push(find)
        personas.push(whatsapp)
        personas.push(youtube)
        personas.push(reader)
        personas.push(search)
        personas.push(web)
        personas.push(history)
    }

    static async create({ q, windowOptions }: { q?: string, windowOptions?: electron.BrowserWindowConstructorOptions }) {

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

    static reopen() {

        if (closedHistory.length > 0) {

            const href = closedHistory.pop()

            Gato.create({ q: href })
        }
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

    close() {

        closedHistory.push(this.window.webContents.getURL())

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

    duplicate() {

        Gato.create({ q: this.window.webContents.getURL() })
    }

    notify({ title, body }: { title: string, body: string }) {

        new electron.Notification({ title, body }).show()
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

    stop() {

        this.window.webContents.stop()
    }

    openDevTools() {

        this.window.webContents.openDevTools()

        if (!electron.app.isPackaged) {

            this.paletteView.webContents.openDevTools()
        }
    }

    closeDevTools() {

        this.window.webContents.closeDevTools()

        if (!electron.app.isPackaged) {

            this.paletteView.webContents.closeDevTools()
        }
    }

    async choose({ q }: { q: string }): Promise<IParseResult> {

        const results = await this.parse({ q })

        return results[0]
    }

    async parse({ q }: { q: string }): Promise<IParseResult[]> {

        const results = await Promise.all(personas.map(async (persona) => persona.parse(q)))
        const flattened = results.reduce((a, b) => a.concat(b), [])
        const filtered = flattened.filter(suggestion => !!suggestion)
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

            const history = await History.getInstance()

            history.add({ href })
        }

        this.hide()
    }

    async bookmark() {

        const history = await History.getInstance()
        const href = this.window.webContents.getURL()

        await history.save({ href })

        this.notify({ title: 'Bookmark Added', body: `${href}` })
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

            console.log('setWindowOpenHandler', url, features)

            if (features) {

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

        this.window.once('close', () => {

            this.close()
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

        // this.window.webContents.on('will-navigate', async (e, url) => {

        //     e.preventDefault()

        //     const { href } = await this.choose({ q: url })
        //     this.open({ href })
        // })

        web.applyOptions(this.window)

        this.titleUpdater = new TitleUpdater(this.window)
    }
}

export default Gato