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
    menu: async () => {
        const applicationMenu = await ipcRenderer.invoke('menu');
        return {
            application: applicationMenu,
            commands: applicationMenu.application.submenu || []
        };
    },
    ...secureInvoke('gato', ['hide', 'show', 'open', 'choose', 'status', 'parse']),
    ...secureInvoke('find', ['find', 'stopFind']),
    ...secureInvoke('command', ['execute-command'])
};

console.log('Exposed API:', api);
console.log('Testing execute-command:', api.command.executeCommand({ command: 'test-command' }));

contextBridge.exposeInMainWorld("gato", api);