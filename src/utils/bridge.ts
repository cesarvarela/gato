import EventEmiter from 'events';
import electron from "electron";

declare const MAIN_WEBPACK_ENTRY: string;

function listen<T>(emitter: EventEmiter, api: T) {

    Object.keys(api).forEach(event => {

        emitter.on(event, api[event])
    })
}

function handleApi<T>(key: string, api: T): void {
    console.log(`Registering API handlers for "${key}" with methods:`, Object.keys(api));

    Object.keys(api).forEach(k => {
        const v = api[k];

        if (typeof v === 'function') {
            const channel = `${key}:${k}`;
            console.log(`- Registering handler for "${channel}"`);

            electron.ipcMain.handle(channel, (e, ...args) => {
                console.log(`Handling "${channel}" request`);
                
                if (e.sender.getURL().startsWith('gato://') || e.sender.getURL().startsWith(MAIN_WEBPACK_ENTRY)) {
                    try {
                        return api[k](...args, e);
                    } catch (error) {
                        console.error(`Error in "${channel}" handler:`, error);
                        throw error;
                    }
                }
                else {
                    console.warn(`Rejected "${channel}" request from unauthorized URL:`, e.sender.getURL());
                    return null;
                }
            });
        }
    });

    console.log(`Finished registering API handlers for "${key}"`);
}

function secureInvoke(key: string, events: string[]): any {

    const api = { [key]: {} };

    events.forEach(event => {

        const channel = `${key}:${event}`;

        api[key][event] = (...args) => {

            // TODO: check if the sender is a gato app
            return electron.ipcRenderer.invoke(channel, ...args)
        }
    })

    return api
}

export { handleApi, listen, secureInvoke }