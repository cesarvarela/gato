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
    }
}

const store = new Store<ISettings>({
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
        }
    }
})

export default store
export { ISettings, IWebOptions }