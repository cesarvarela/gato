import electron from "electron";

class WhatsApp {
    static instance: WhatsApp;

    static async getInstance() {

        if (!WhatsApp.instance) {
            WhatsApp.instance = new WhatsApp();
            await WhatsApp.instance.init();
        }

        return WhatsApp.instance;
    }

    async init() {
        electron.session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {

            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';

            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }
}

export default WhatsApp