import { Confidence, IFind, IFinder, IParseResult, IPersona, IStopFind, PersonaName } from '../../interfaces';
import { handleApi } from '../../utils/bridge';
import Gato from '../Gato';

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

    async parse(q: string): Promise<IParseResult[]> {

        const suggestions: IParseResult[] = []

        if (q === ':') {
            return [{
                name: this.name,
                confidence: Confidence.VeryHigh,
                params: { paletteMode: 'find' },
                href: 'about:blank'
            }]
        }

        const parsed = q.split(' ')
        const command = parsed[0]

        switch (command) {
            case ":accounts":
            case ":account":
                suggestions.push({
                    name: this.name,
                    confidence: Confidence.VeryHigh,
                    href: 'gato://accounts'
                })
                break
            
            case ":home":
                suggestions.push({
                    name: this.name,
                    confidence: Confidence.VeryHigh,
                    href: 'gato://home'
                })
                break
            
            case ":settings":
            case ":config":
                suggestions.push({
                    name: this.name,
                    confidence: Confidence.VeryHigh,
                    href: 'gato://home/settings'
                })
                break
            
            case ":youtube":
                const youtubeQuery = parsed.slice(1).join(' ')
                if (youtubeQuery) {
                    suggestions.push({
                        name: this.name,
                        confidence: Confidence.VeryHigh,
                        href: `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`
                    })
                } else {
                    suggestions.push({
                        name: this.name,
                        confidence: Confidence.VeryHigh,
                        href: 'https://www.youtube.com'
                    })
                }
                break
            
            case ":find":
            case ":search":
                const findQuery = parsed.slice(1).join(' ')
                if (findQuery) {
                    suggestions.push({
                        name: this.name,
                        confidence: Confidence.VeryHigh,
                        params: { text: findQuery, paletteMode: 'find' },
                        href: 'about:blank'
                    })
                }
                break
        }

        return suggestions
    }
}

export default Find
