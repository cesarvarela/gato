import EventEmiter from 'events';
import electron from "electron";

declare const MAIN_WEBPACK_ENTRY: string;

function listen<T>(emitter: EventEmiter, api: T) {

    Object.keys(api).forEach(event => {

        emitter.on(event, api[event])
    })
}

function handleApi<T>(key: string, api: T): void {

    Object.keys(api).forEach(k => {
        const v = api[k];

        if (typeof v === 'function') {

            const channel = `${key}:${k}`;

            electron.ipcMain.handle(channel, (e, ...args) => {

                if (e.sender.getURL().startsWith('gato://') || e.sender.getURL().startsWith(MAIN_WEBPACK_ENTRY)) {

                    return api[k](...args, e)
                }
                else {

                    return null
                }
            });
        }
    })
}

function secureInvoke(key: string, events: string[]): any {

    const api = { [key]: {} };

    events.forEach(event => {

        const channel = `${key}:${event}`;

        api[key][event] = (...args) => {

            return electron.ipcRenderer.invoke(channel, ...args)
        }
    })

    return api
}

export { handleApi, listen, secureInvoke }