import electron, { MenuItemConstructorOptions } from "electron"
import EventEmiter from "events"
import { WindowEvent } from "../interfaces"
import settings from "./Settings"

class Menu extends EventEmiter {

    static instance: Menu

    static async getInstance() {

        if (!Menu.instance) {

            Menu.instance = new Menu()
            await Menu.instance.init()
        }

        return Menu.instance
    }

    paletteEvent(event: WindowEvent, params: any) {

        this.emit(event, params)
    }

    menu = {
        application: {
            label: "Application",
            submenu: [
                {
                    label: "Show palette",
                    accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
                    click: (item, window, event) => this.paletteEvent('show', { window, event, item })
                },
                {
                    label: "Hide palette",
                    accelerator: 'Esc',
                    click: (item, window, event) => this.paletteEvent('hide', { window, event, item })
                },
                {
                    label: "Open palette with location",
                    accelerator: 'Cmd+L',
                    click: (item, window, event) => this.paletteEvent('location', { window, event, item })
                },
                {
                    label: "Find",
                    accelerator: 'Cmd+F',
                    click: (item, window, event) => this.paletteEvent('find', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: "New Window",
                    accelerator: 'Cmd+N',
                    click: (item, window, event) => this.paletteEvent('new', { window, event, item, params: {} })
                },
                {
                    label: "New Window with Web Security = false",
                    accelerator: 'Cmd+Alt+N',
                    click: (item, window, event) => this.paletteEvent('new', { window, event, item, params: { windowOptions: { webPreferences: { webSecurity: false, sandbox: false } } } })
                },
                {
                    label: "Close Window",
                    accelerator: 'Cmd+W',
                    click: (item, window, event) => this.paletteEvent('close', { window, event, item })
                },
                {
                    label: "Back",
                    accelerator: 'Cmd+[',
                    click: (item, window, event) => this.paletteEvent('back', { window, event, item })
                },
                {
                    label: "Forward",
                    accelerator: 'Cmd+]',
                    click: (item, window, event) => this.paletteEvent('forward', { window, event, item })
                },
                {
                    label: "Reload",
                    accelerator: 'Cmd+R',
                    click: (item, window, event) => this.paletteEvent('reload', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: "DevTools",
                    accelerator: 'Cmd+Alt+I',
                    click: (item, window, event) => this.paletteEvent('openDevTools', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: 'Open settings folder',
                    accelerator: 'Cmd+,',
                    click: () => {
                        settings.openInEditor()
                    }
                },
                {
                    label: "Quit",
                    accelerator: "Command+Q",
                    click: () => this.emit("quit")
                }
            ]
        },
        edit: {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    role: "undo",
                },
                {
                    label: "Redo",
                    accelerator: "Shift+CmdOrCtrl+Z",
                    role: "redo",
                },
                {
                    type: "separator"
                },
                {
                    label: "Cut",
                    accelerator: "CmdOrCtrl+X",
                    role: "cut",
                },
                {
                    label: "Copy",
                    accelerator: "CmdOrCtrl+C",
                    role: "copy"
                },
                {
                    label: "Paste",
                    accelerator: "CmdOrCtrl+V",
                    role: "paste",
                },
                {
                    label: "Select All",
                    accelerator: "CmdOrCtrl+A",
                    role: "selectAll"
                },
                {
                    role: 'zoomin',
                    accelerator: 'CommandOrControl+='
                },
                {
                    role: 'zoomout',
                    accelerator: 'CommandOrControl+-'
                }
            ]
        },
        file: {
            label: "File",
            submenu: [
                {
                    label: "Reopen Closed window",
                    accelerator: "CmdOrCtrl+Shift+T",
                    click: (item, window) => this.emit("reopen", { window })
                }
            ]
        }
    }

    async init() {

        const application = new electron.MenuItem(this.menu.application as MenuItemConstructorOptions)
        const edit = new electron.MenuItem(this.menu.edit as MenuItemConstructorOptions)
        const file = new electron.MenuItem(this.menu.file as MenuItemConstructorOptions)

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([application, edit, file]))

        electron.ipcMain.handle('menu', (e) => {
            const menu = JSON.parse(JSON.stringify(this.menu))

            return menu
        })
    }
}

export default Menu
