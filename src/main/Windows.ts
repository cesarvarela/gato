import electron from 'electron';
import EventEmiter from 'events';
import { IFind, IStopFind, PaletteEvent, WindowEvent } from '../interfaces';
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

    async new({ q = '' } = {}) {

        const gato = await Gato.create({ q })
        this.windows[gato.id] = gato

        return gato
    }

    async close({ gato }: { gato: Gato }) {

        delete this.windows[gato.id]
        gato.close()
    }

    listen(emitter: EventEmiter, api: Record<any, unknown>) {

        Object.keys(api).forEach(event => {

            emitter.on(event, api[event] as any)
        })
    }

    async init() {

        const menu = await Menu.getInstance()

        const listeners: Record<PaletteEvent, unknown> = {
            show: ({ window }) => {

                this.windows[window.id].call({ params: { mode: 'show' } })
            },
            find: ({ window }) => {

                this.windows[window.id].call({ params: { mode: 'find' } })
            },
            hide: ({ window }) => {

                this.windows[window.id].call({ params: { mode: 'hide' } })
            },
            location: ({ window }) => {

                this.windows[window.id].call({ params: { mode: 'location' } })
            }
        }

        this.listen(menu, listeners)


        const windowListeners: Record<WindowEvent, unknown> = {
            close: ({ window }) => {

                this.close({ gato: this.windows[window.id] })
            },
            new: () => {

                this.new()
            },
            back: ({ window }) => {

                this.windows[window.id].back()
            },
            forward: ({ window }) => {

                this.windows[window.id].forward()
            },
            openDevTools: ({ window }) => {

                this.windows[window.id].openDevTools()
            },
            reload: ({ window }) => {
                this.windows[window.id].reload()
            }

        }

        this.listen(menu, windowListeners)


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