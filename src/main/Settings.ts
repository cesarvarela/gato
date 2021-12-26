import Store from 'electron-store'

interface ISettings {
    googleSearch: {
        key: string,
        cx: string,
    }
    reader: {
        whitelist: string[],
    },
    web: {
        options: Array<{ url: URL, trustCertificate: boolean }>
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
        },
        web: {
            type: 'object',
            default: {
                options: {
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
        },
        web: {
            options: []
        }
    }
})

export default store
export { ISettings }