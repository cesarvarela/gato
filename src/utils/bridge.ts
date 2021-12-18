import EventEmiter from 'events';
import electron from "electron";

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

                return api[k](...args, e)
            });
        }
    })
}

export { handleApi, listen }