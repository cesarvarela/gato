import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: IGato = {
    search: (query) => ipcRenderer.invoke('search', query),
    open: (url) => ipcRenderer.invoke('open', url),
    hide: () => ipcRenderer.invoke('hide'),
    read: ({ url }) => ipcRenderer.invoke('read', { url }),
    choose: ({ q }) => ipcRenderer.invoke('choose', { q }),
}

contextBridge.exposeInMainWorld("gato", api);