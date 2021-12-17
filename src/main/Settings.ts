import Store from 'electron-store'

interface ISettings {
    googleSearch: {
        key: string,
        cx: string,
    }
    reader: {
        whitelist: string[],
    }
}

const store = new Store<ISettings>({
    schema: {
        googleSearch: {
            type: 'object',
            default: {
                key: {
                    type: 'string',
                },
                cx: {
                    type: 'string',
                }
            }
        },
        reader: {
            type: 'object',
            default: {
                whitelist: {
                    type: 'array',
                }
            }
        }
    },
    defaults: {
        googleSearch: {
            cx: '',
            key: ''
        },
        reader: {
            whitelist: [],
        }
    }
})

export default store

