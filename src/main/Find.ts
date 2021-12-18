import { IFind, IFinder, IParseResult, IPersona, IStopFind, PersonaName } from '../interfaces';
import { handleApi } from '../utils/bridge';
import Gato from './Gato';

class Find implements IPersona {

    api: IFinder
    name: PersonaName = 'find'

    static instance: Find

    static async getInstance() {

        if (!Find.instance) {
            const instance = new Find()
            await instance.init()
            Find.instance = instance
        }

        return Find.instance
    }

    async init() {

        this.api = {
            find: this.find,
            stopFind: this.stopFind,
        }

        handleApi('find', this.api)
    }

    async find({ text, forward = true, findNext = false, matchCase = false }: IFind) {

        return Gato.getFocused().window.webContents.findInPage(text, {
            forward,
            matchCase,
            findNext
        })
    }

    async stopFind({ action }: IStopFind) {

        Gato.getFocused().window.webContents.stopFindInPage(action)
    }

    async parse(q: string): Promise<IParseResult> {

        if (q.startsWith(':')) {

            return { name: this.name, confidence: 10, params: { q } }
        }
    }
}

export default Find
