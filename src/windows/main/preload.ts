import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: Partial<IGato> = {

    on: (channel, callback) => ipcRenderer.on(`gato:${channel}`, callback),
    off: (channel, callback) => ipcRenderer.off(`gato:${channel}`, callback),

    gato: {
        hide: () => ipcRenderer.invoke('gato:hide'),
        show: (...args) => ipcRenderer.invoke('gato:show', ...args),
        open: (...args) => ipcRenderer.invoke('gato:open', ...args),
        choose: (...args) => ipcRenderer.invoke('gato:choose', ...args),
        status: (...args) => ipcRenderer.invoke('gato:status', ...args),
        find: (...args) => ipcRenderer.invoke('gato:find', ...args),
        stopFind: (...args) => ipcRenderer.invoke('gato:stopFind', ...args),
    }
}

contextBridge.exposeInMainWorld("gato", api);