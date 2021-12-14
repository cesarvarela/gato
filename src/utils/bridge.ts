import electron from "electron";

function exposeApi<T>(key: string, api: T): T {

    const exposed: T = {} as T

    Object.keys(api).forEach(k => {

        const v = api[k];

        if (typeof v === 'function') {
            exposed[`${key}:${k}`] = (...args) => electron.ipcRenderer.invoke(`${key}:${k}`, ...args);
        }
        else {
            exposed[`${key}:${k}`] = api[k];
        }
    })

    return exposed
}

function handleApi<T>(key: string, api: T): void {

    Object.keys(api).forEach(k => {
        const v = api[k];

        if (typeof v === 'function') {

            const channel = `${key}:${k}`;

            electron.ipcMain.handle(channel, (e, ...args) => api[k](...args, e));
        }
    })
}

export { exposeApi, handleApi }