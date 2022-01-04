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

                    console.log('allowed request from ', e.sender.getURL())

                    return api[k](...args, e)
                }
                else {

                    console.log('cancelled request from ', e.sender.getURL())

                    return null
                }
            });
        }
    })
}

export { handleApi, listen }