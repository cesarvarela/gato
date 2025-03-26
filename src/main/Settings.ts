import Store from 'electron-store'
import { handleApi } from '../utils/bridge';
import { ISettings as ISettingsAPI } from '../interfaces';

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
        client_id: string,
        client_secret: string,
    },
    github: {
        client_id: string,
        client_secret: string,
    },
    twitter: {
        client_id: string,
        client_secret: string,
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
                },
                "client_id": {
                    type: 'string',
                },
                "client_secret": {
                    type: 'string',
                }
            }
        },
        github: {
            type: 'object',
            properties: {
                "client_id": {
                    type: 'string',
                },
                "client_secret": {
                    type: 'string',
                }
            }
        },
        twitter: {
            type: 'object',
            properties: {
                "client_id": {
                    type: 'string',
                },
                "client_secret": {
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
            key: '',
            client_id: '',
            client_secret: ''
        },
        github: {
            client_id: '',
            client_secret: ''
        },
        twitter: {
            client_id: '',
            client_secret: ''
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

// Create API for renderer process
const settingsApi = {
    getYouTubeSettings: async () => {
        return {
            key: store.get('youtube.key', ''),
            client_id: store.get('youtube.client_id', ''),
            client_secret: store.get('youtube.client_secret', '')
        };
    },
    setYouTubeSettings: async (settings: { key: string, client_id: string, client_secret: string }) => {
        store.set('youtube.key', settings.key);
        store.set('youtube.client_id', settings.client_id);
        store.set('youtube.client_secret', settings.client_secret);
    },
    getGitHubSettings: async () => {
        return {
            client_id: store.get('github.client_id', ''),
            client_secret: store.get('github.client_secret', '')
        };
    },
    setGitHubSettings: async (settings: { client_id: string, client_secret: string }) => {
        store.set('github.client_id', settings.client_id);
        store.set('github.client_secret', settings.client_secret);
    },
    getTwitterSettings: async () => {
        return {
            client_id: store.get('twitter.client_id', ''),
            client_secret: store.get('twitter.client_secret', '')
        };
    },
    setTwitterSettings: async (settings: { client_id: string, client_secret: string }) => {
        store.set('twitter.client_id', settings.client_id);
        store.set('twitter.client_secret', settings.client_secret);
    },
    needsRestart: async () => {
        // For now, we'll assume settings changes require restart
        return true;
    }
};

// Register the API
handleApi<ISettingsAPI>('settings', settingsApi);

export default store
export { ISettings, IWebOptions }