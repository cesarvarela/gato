import electron from 'electron';
import EventEmiter from 'events';
import Gato from './Gato';
import Menu from './Menu';

class Windows extends EventEmiter {

    windows: Record<string, Gato> = {}

    static async create() {

        const instance = new Windows()
        await instance.init()

        return instance
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

        menu.on('show', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].show()
        })

        menu.on('hide', ({ window }: { window: electron.BrowserWindow }) => {

            this.windows[window.id].hide()
        })

        electron.ipcMain.handle('open', async (e, { snack = 'reader', params = {} }) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.windows[window.id].open({ snack, params })
        })

        electron.ipcMain.handle('hide', async (e) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.windows[window.id].hide()
        })

        electron.ipcMain.handle('choose', async (e, { q }: { q: string }) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            return this.windows[window.id].choose({ q })
        })
    }
}

export default Windows