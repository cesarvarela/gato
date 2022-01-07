import { ipcRenderer, contextBridge } from "electron";
import { secureInvoke } from "../../utils/bridge";
import { IGato } from "../../interfaces";

const api: Partial<IGato> = {

    on: (name, callback) => {
        ipcRenderer.addListener(`gato:${name}`, callback)

        return () => {
            ipcRenderer.removeListener(`gato:${name}`, callback)
        }
    },

    ...secureInvoke('gato', ['hide', 'show', 'open', 'choose', 'status', 'parse']),

    ...secureInvoke('find', ['find', 'stopFind']),
}

contextBridge.exposeInMainWorld("gato", api);