import electron, { MenuItemConstructorOptions } from "electron"
import EventEmiter from "events"
import storage from "electron-json-storage"
import _ from 'lodash'
import { PaletteEvent, WindowEvent } from "../interfaces"

class Menu extends EventEmiter {

    static instance: Menu

    static async getInstance() {

        if (!Menu.instance) {

            Menu.instance = new Menu()
            await Menu.instance.init()
        }

        return Menu.instance
    }

    paletteEvent(event: PaletteEvent | WindowEvent, params: any) {
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
                    click: (item, window, event) => this.emit('new', { window, event, item })
                },
                {
                    label: "Close Window",
                    accelerator: 'Cmd+W',
                    click: (item, window, event) => this.emit('close', { window, event, item })
                },
                {
                    label: "Back",
                    accelerator: 'Ctrl+Cmd+Left',
                    click: (item, window, event) => this.emit('back', { window, event, item })
                },
                {
                    label: "Forward",
                    accelerator: 'Ctrl+Cmd+Right',
                    click: (item, window, event) => this.emit('forward', { window, event, item })
                },
                {
                    label: "Reload",
                    accelerator: 'Cmd+R',
                    click: (item, window, event) => this.emit('reload', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: "DevTools",
                    accelerator: 'Cmd+Alt+I',
                    click: (item, window, event) => this.emit('openDevTools', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: 'Open settings folder',
                    accelerator: 'Cmd+,',
                    click: () => {
                        electron.shell.showItemInFolder(storage.getDefaultDataPath())
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
                }
            ]
        }
    }

    async init() {

        const application = new electron.MenuItem(this.menu.application as MenuItemConstructorOptions)
        const edit = new electron.MenuItem(this.menu.edit as MenuItemConstructorOptions)

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([application, edit]))

        electron.ipcMain.handle('menu', (e) => {
            const menu = JSON.parse(JSON.stringify(this.menu))

            return menu
        })
    }
}

export default Menu
