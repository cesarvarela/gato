import { ipcRenderer, contextBridge } from "electron";
import { IFind, IGato } from "../../interfaces";

const api: Partial<IGato> = {
    search: (query) => ipcRenderer.invoke('search', query),
    open: (url) => ipcRenderer.invoke('open', url),
    read: ({ url }) => ipcRenderer.invoke('read', { url }),
    choose: ({ q }) => ipcRenderer.invoke('choose', { q }),

    status: () => ipcRenderer.invoke('status'),
    menu: () => ipcRenderer.invoke('menu'),
}

contextBridge.exposeInMainWorld("gato", api);