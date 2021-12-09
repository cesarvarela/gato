import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";

const api: IGato = {
    search: (query) => ipcRenderer.invoke('search', query),
}

contextBridge.exposeInMainWorld("gato", api);