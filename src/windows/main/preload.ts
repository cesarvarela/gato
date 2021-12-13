import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: Partial<IGato> = {
    hide: () => ipcRenderer.invoke('hide'),
    show: (params) => ipcRenderer.invoke('show', params),

    open: (url) => ipcRenderer.invoke('open', url),
    choose: ({ q }) => ipcRenderer.invoke('choose', { q }),

    on: (channel, callback) => ipcRenderer.on(`gato:${channel}`, callback),
    off: (channel, callback) => ipcRenderer.off(`gato:${channel}`, callback),

    status: () => ipcRenderer.invoke('status'),

    find: (params) => ipcRenderer.invoke('find', params),
    stopFind: (params) => ipcRenderer.invoke('stopFind', params),
}

contextBridge.exposeInMainWorld("gato", api);