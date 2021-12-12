import { ipcRenderer, contextBridge } from "electron";
import { IFind, IGato } from "../../interfaces";

const api: IGato = {
    search: (query) => ipcRenderer.invoke('search', query),
    open: (url) => ipcRenderer.invoke('open', url),
    hide: () => ipcRenderer.invoke('hide'),
    show: (params) => ipcRenderer.invoke('show', params),
    read: ({ url }) => ipcRenderer.invoke('read', { url }),
    choose: ({ q }) => ipcRenderer.invoke('choose', { q }),
    on: (channel, callback) => ipcRenderer.on(`gato:${channel}`, callback),
    status: () => ipcRenderer.invoke('status'),
    find: (params: IFind) => ipcRenderer.invoke('find', params),
    stopFind: (params) => ipcRenderer.invoke('stopFind', params),
}

contextBridge.exposeInMainWorld("gato", api);