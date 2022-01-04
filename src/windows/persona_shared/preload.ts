import { ipcRenderer, contextBridge } from "electron";
import { IGato } from "../../interfaces";
// import { EthereumProvider } from 'eip1193-provider'

const api: Partial<IGato> = {

    menu: () => ipcRenderer.invoke('menu'),

    reader: {
        read: (...args) => ipcRenderer.invoke('reader:read', ...args),
    },

    gato: {
        open: (...args) => ipcRenderer.invoke('gato:open', ...args),
        choose: (...args) => ipcRenderer.invoke('gato:choose', ...args),
    },

    youtube: {
        getComments: (...args) => ipcRenderer.invoke('youtube:getComments', ...args),
    },

    search: {
        query: (...args) => ipcRenderer.invoke('search:query', ...args),
    }
}

contextBridge.exposeInMainWorld("gato", api);

// const ethereum = new EthereumProvider('wss://mainnet.infura.io/ws')

// ethereum.enable()
// contextBridge.exposeInMainWorld("ethereum", ethereum)

// console.log('ethereum', ethereum)
