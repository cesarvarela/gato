import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: Partial<IGato> = {

    on: (name, callback) => {
        ipcRenderer.addListener(`gato:${name}`, callback)

        return () => {
            ipcRenderer.removeListener(`gato:${name}`, callback)
        }
    },

    gato: {
        hide: () => ipcRenderer.invoke('gato:hide'),
        show: (...args) => ipcRenderer.invoke('gato:show', ...args),
        open: (...args) => ipcRenderer.invoke('gato:open', ...args),
        choose: (...args) => ipcRenderer.invoke('gato:choose', ...args),
        status: (...args) => ipcRenderer.invoke('gato:status', ...args),
        parse: (...args) => ipcRenderer.invoke('gato:parse', ...args),
    },

    find: {
        find: (...args) => ipcRenderer.invoke('find:find', ...args),
        stopFind: (...args) => ipcRenderer.invoke('find:stopFind', ...args),
    }
}

contextBridge.exposeInMainWorld("gato", api);