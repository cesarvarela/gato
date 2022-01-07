import { ipcRenderer, contextBridge } from "electron";
import { secureInvoke } from "../../utils/bridge";
import { IGato } from "../../interfaces";
// import { EthereumProvider } from 'eip1193-provider'

const api: Partial<IGato> = {

    menu: () => ipcRenderer.invoke('menu'),

    ...secureInvoke('reader', ['read']),

    ...secureInvoke('gato', ['open', 'choose']),

    ...secureInvoke('youtube', ['getComments']),

    ...secureInvoke('search', ['query']),
}

contextBridge.exposeInMainWorld("gato", api);

// const ethereum = new EthereumProvider('wss://mainnet.infura.io/ws')

// ethereum.enable()
// contextBridge.exposeInMainWorld("ethereum", ethereum)

// console.log('ethereum', ethereum)
