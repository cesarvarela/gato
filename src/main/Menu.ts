import electron from "electron"
import EventEmiter from "events"
import storage from "electron-json-storage"

class Menu extends EventEmiter {

    static instance: Menu

    static async getInstance() {

        if (!Menu.instance) {

            Menu.instance = new Menu()
            await Menu.instance.init()
        }

        return Menu.instance
    }

    async init() {

        const application = new electron.MenuItem({
            label: "Application",
            submenu: [
                {
                    label: "Show palette",
                    accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
                    click: (item, window, event) => this.emit('show', { window, event, item })
                },
                {
                    label: "Hide palette",
                    accelerator: 'Esc',
                    click: (item, window, event) => this.emit('hide', { window, event, item })
                },
                {
                    label: "New Window",
                    accelerator: 'Cmd+N',
                    click: (item, window, event) => this.emit('newWindow', { window, event, item })
                },
                {
                    label: "Close Window",
                    accelerator: 'Cmd+W',
                    click: (item, window, event) => this.emit('closeWindow', { window, event, item })
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
                    label: "DevTools",
                    accelerator: 'Cmd+Alt+I',
                    click: (item, window, event) => this.emit('openDevTools', { window, event, item })
                },
                {
                    type: "separator"
                },
                {
                    label: 'Open settings folder',
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
        })

        const edit = new electron.MenuItem({
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
        })

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([application, edit]))
    }
}

export default Menu
