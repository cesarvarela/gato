import electron from "electron";

class TitleUpdater {

    window: electron.BrowserWindow

    private loading = false
    private url = ''

    constructor(window: electron.BrowserWindow) {

        this.window = window

        window.webContents.on('did-start-navigation', (e, url, isInPlace, isMainFrame) => {
            if (isMainFrame) {
                this.loading = true
                this.url = url
                this.update()
            }
        })

        window.webContents.on('will-redirect', (e, url, isInPlace, isMainFrame) => {
            if (isMainFrame) {
                this.loading = true
                this.url = url
                this.update()
            }
        })

        window.webContents.on('did-navigate', (e, url, httpResponseCode, httpStatusText) => {
            this.loading = false
            this.url = url
            this.update()
        })

        window.webContents.on('did-finish-load', (e) => {
            this.loading = false
            this.update()
        })

        window.webContents.on('page-title-updated', (e, title, explicitSet) => {
            this.update()
        })

        // TODO: get this working

        // window.on('did-fail-load', function (tabId, errorCode, errorDesc, validatedURL, isMainFrame) {
        //     if (isMainFrame && validatedURL) {

        //     }
        // })

        // window.on('crashed', function (tabId, isKilled) {

        // })
    }

    update() {

        this.window.setTitle(`${this.loading ? '--' : 'OK'} : ${this.url}`)
    }
}

export default TitleUpdater