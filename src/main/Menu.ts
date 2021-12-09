import electron from "electron"
import EventEmiter from "events"

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
                    label: "Open palette",
                    accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
                    click: (item, window, event) => this.emit('show', { window, event, item })
                },
                {
                    type: "separator"
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
