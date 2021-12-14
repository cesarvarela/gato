import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: Partial<IGato> = {
    search: (query) => ipcRenderer.invoke('search', query),
    open: (url) => ipcRenderer.invoke('open', url),

    reader: {
        read: (...args) => ipcRenderer.invoke('reader:read', ...args),
        whitelist: (...args) => ipcRenderer.invoke('reader:whitelist', ...args),
        blacklist: (...args) => ipcRenderer.invoke('reader:blacklist', ...args),
    },

    choose: ({ q }) => ipcRenderer.invoke('choose', { q }),

    status: () => ipcRenderer.invoke('status'),
    menu: () => ipcRenderer.invoke('menu'),
}

contextBridge.exposeInMainWorld("gato", api);