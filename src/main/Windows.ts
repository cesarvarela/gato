import electron from 'electron';
import EventEmiter from 'events';
import Menu from './Menu';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

class Windows extends EventEmiter {

    static async create() {

        const instance = new Windows()
        await instance.init()

        return instance
    }

    async newWindow() {
        // Create the browser window.
        const window = new electron.BrowserWindow({
            height: 600,
            width: 800,
        });

        const view = new electron.BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })

        window.setBrowserView(view)

        view.setBounds({ x: 0, y: 0, width: window.getBounds().width, height: window.getBounds().height })
        view.setAutoResize({ horizontal: true, vertical: true })
        view.webContents.loadURL(MAIN_WEBPACK_ENTRY)
    }

    async init() {

        const menu = await Menu.getInstance()

        menu.on('newWindow', () => {

            this.newWindow()
        })

        menu.on('closeWindow', ({ window }: { window: electron.BrowserWindow }) => {

            window.close()
        })

        menu.on('back', ({ window }: { window: electron.BrowserWindow }) => {

            if (window.webContents.canGoBack()) {
                window.webContents.goBack()
            }
        })

        menu.on('forward', ({ window }: { window: electron.BrowserWindow }) => {

            if (window.webContents.canGoForward()) {
                window.webContents.goForward()
            }
        })
    }
}

export default Windows