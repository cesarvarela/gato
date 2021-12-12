import electron from 'electron';
import EventEmiter from 'events';
import { IFind, IPaletteParams, IStopFind } from '../interfaces';
import Gato from './Gato';
import Menu from './Menu';

class Windows extends EventEmiter {

    static instance: Windows
    windows: Record<string, Gato> = {}

    static async getInstance() {

        if (!Windows.instance) {

            Windows.instance = new Windows()
            await Windows.instance.init()
        }

        return Windows.instance
    }

    async init() {

        const menu = await Menu.getInstance()

        menu.on('newWindow', async () => {

            const gato = await Gato.create()

            this.windows[gato.id] = gato
        })

        menu.on('closeWindow', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].close()
            delete this.windows[window.id]
        })

        menu.on('back', ({ window }: { window: electron.BrowserWindow }) => {

            if (this.windows[window.id].canGoBack()) {

                this.windows[window.id].back()
            }
        })

        menu.on('forward', ({ window }: { window: electron.BrowserWindow }) => {

            if (this.windows[window.id].canGoForward()) {

                this.windows[window.id].forward()
            }
        })

        menu.on('reload', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].reload()
        })

        menu.on('openDevTools', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].openDevTools()
        })

        menu.on('show', ({ window, params }: { window: electron.BrowserWindow, params: IPaletteParams }) => {

            this.windows[window.id].call({ params })
        })

        menu.on('hide', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].call({ params: { mode: 'hide' } })
        })

        electron.ipcMain.handle('open', async (e, { snack = 'reader', params = {} }) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.windows[window.id].open({ snack, params })
        })

        electron.ipcMain.handle('hide', async (e) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.windows[window.id].hide()
        })

        electron.ipcMain.handle('show', async (e, params) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.windows[window.id].show(params)
        })

        electron.ipcMain.handle('choose', async (e, { q }: { q: string }) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            return this.windows[window.id].choose({ q })
        })

        electron.ipcMain.handle('status', async (e) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            return this.windows[window.id].status()
        })

        electron.ipcMain.handle('find', async (e, params: IFind) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            return this.windows[window.id].find(params)
        })

        electron.ipcMain.handle('stopFind', async (e, params: IStopFind) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            return this.windows[window.id].stopFind(params)
        })
    }
}

export default Windows