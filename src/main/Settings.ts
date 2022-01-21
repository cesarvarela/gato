import Store from 'electron-store'

interface IWebOptions {
    url: URL | '*',
    trustCertificate?: boolean,
    customCSS?: string,
    allowPopups?: boolean,
}

interface ISettings {
    googleSearch: {
        key: string,
        cx: string,
    }
    reader: {
        whitelist: string[],
    },
    web: {
        options: Array<IWebOptions>
    },
    youtube: {
        key: string,
    },
    history: {
        bookmarks: string[],
        items: string[]
    },
    alternative: {
        mappings: Array<Record<string, string>>
    },
    search: {
        baseUrl: string,
    }
}

const store = new Store<Partial<ISettings>>({
    schema: {
        googleSearch: {
            type: 'object',
            properties: {
                "key": {
                    type: 'string',
                },
                "cx": {
                    type: 'string',
                }
            },
        },
        reader: {
            type: 'object',
            properties: {
                "whitelist": {
                    type: 'array',
                }
            },
        },
        web: {
            type: 'object',
            properties: {
                "options": {
                    type: 'array',
                }
            },
        },
        youtube: {
            type: 'object',
            properties: {
                "key": {
                    type: 'string',
                }
            }
        },
        history: {
            type: 'object',
            properties: {
                "bookmarks": {
                    type: 'array',
                },
                "items": {
                    type: 'array',
                }
            }
        },
        alternative: {
            type: 'object',
            properties: {
                "mappings": {
                    type: 'array',
                }
            }
        },
        search: {
            type: 'object',
            properties: {
                "baseUrl": {
                    type: 'string',
                },
            }
        }
    },
    defaults: {
        googleSearch: {
            cx: '',
            key: ''
        },
        reader: {
            whitelist: [
                'github.com',
            ],
        },
        web: {
            options: [
                {
                    url: '*',
                    customCSS: "html { background-color: #FFFFFF; }",
                }
            ]
        },
        youtube: {
            key: ''
        },
        history: {
            bookmarks: [],
            items: []
        },
        alternative: {
            mappings: []
        },
        search: {
            baseUrl: 'https://www.google.com/search?q=',
        }
    }
})

export default store
export { ISettings, IWebOptions }