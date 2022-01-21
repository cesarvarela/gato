import electron from "electron";
import { Confidence, IParseResult, IPersona, PersonaName } from "../../interfaces";
import isURL from "validator/lib/isURL";

class WhatsApp implements IPersona {

    name: PersonaName = 'whatsapp'

    static instance: WhatsApp;

    static async getInstance() {

        if (!WhatsApp.instance) {
            WhatsApp.instance = new WhatsApp();
            await WhatsApp.instance.init();
        }

        return WhatsApp.instance;
    }

    isWhatsAppURL(url: string) {
        return isURL(url, { require_protocol: false, host_whitelist: ['whatsapp.com', 'web.whatsapp.com'] })
    }

    async parse(q: string): Promise<IParseResult[]> {

        if (this.isWhatsAppURL(q)) {
            return [{ name: this.name, confidence: Confidence.VeryHigh, href: q }]
        }
    }

    async init() {
        electron.session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {

            // TODO: only rewrite headers if it's a whatsapp url?
            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';

            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
    }
}

export default WhatsApp