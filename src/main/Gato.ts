import EventEmiter from 'events'
import electron from 'electron'
import GoogleSearch from './GoogleSearch'
import Menu from './Menu'

declare const SEARCH_WEBPACK_ENTRY: string;

class Gato extends EventEmiter {

    static async create() {

        const instance = new Gato()
        instance.init()

        return instance
    }

    show({ window }) {

        const view = window.getBrowserView()

        view.setBounds({ x: 0, y: 0, width: window.getBounds().width, height: window.getBounds().height })
    }

    hide({ window }: { window: electron.BrowserWindow }) {

        const view = window.getBrowserView()

        view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    }

    async init() {

        const menu = await Menu.getInstance()

        menu.on('show', () => {

            const window = electron.BrowserWindow.getFocusedWindow()
            this.show({ window })
        })

        menu.on('hide', () => {

            const window = electron.BrowserWindow.getFocusedWindow()
            this.hide({ window })
        })

        const googleSearch = await GoogleSearch.create()

        electron.ipcMain.handle('search', async (e, { q }) => {

            const { data: { items } } = await googleSearch.search({ q })

            return items
        })

        electron.ipcMain.handle('open', async (e, { snack = 'default', params = {} }) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            let target = null

            switch (snack) {

                case 'search': {
                    const { q } = params

                    target = `${SEARCH_WEBPACK_ENTRY}?q=${q}`
                }
                    break;

                default: {
                    const { url } = params

                    target = url
                }
            }

            console.log('loading', target)

            window.loadURL(target)
            window.webContents.focus()
            this.hide({ window })
        })

        electron.ipcMain.handle('hide', async (e) => {

            const window = electron.BrowserWindow.fromWebContents(e.sender)

            this.hide({ window })
            window.webContents.focus()
        })
    }

}

export default Gato