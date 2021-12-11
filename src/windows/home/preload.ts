import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: IGato = {
    search: (query) => ipcRenderer.invoke('search', query),
    open: (url) => ipcRenderer.invoke('open', url),
    hide: () => ipcRenderer.invoke('hide'),
}

contextBridge.exposeInMainWorld("gato", api);