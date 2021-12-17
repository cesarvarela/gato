import electron, { MenuItemConstructorOptions } from 'electron'

interface ISearchResult {
    title: string
}

type PaletteEvent = 'location' | 'find' | 'hide' | 'show'

type WindowEvent = 'new' | 'close' | 'back' | 'forward' | 'reload' | 'openDevTools'

type PersonaName = 'search' | 'web' | 'read' | 'youtube' | 'find' | 'home'

type IPersona = {
    snack: PersonaName
    params: Record<string, unknown>
}

interface IPaletteParams {
    mode: PaletteEvent
}

interface IStatus {
    url: { href: string }
    bounds: electron.Rectangle
}

interface IFind {
    text: string
    forward?: boolean
    matchCase?: boolean
    findNext?: boolean
}

interface IStopFind {
    action: 'clearSelection' | 'keepSelection' | 'activateSelection'
}

type ITarget = '_blank' | '_self'

interface IGato {

    choose: ({ q }: { q: string }) => Promise<{ snack: string, params: Record<string, unknown> }>
    open: ({ snack, params }: { snack?: string, params?: unknown }) => void

    hide: () => void,
    show: ({ bounds }: { bounds: electron.Rectangle }) => void,

    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    read: ({ url }: { url: string }) => Promise<{ content: string, title: string, author: string, date_published: string }>

    on: (channel: string, cb: (e, params) => void) => void,
    off: (channel: string, cb: (e, params) => void) => void,

    status: () => Promise<IStatus>,
    menu: () => Promise<Record<string, MenuItemConstructorOptions>>,

    find: (params: IFind) => Promise<number>,
    stopFind: (params?: IStopFind) => Promise<void>,

    reader: IReader,

    ethereum: any
}

interface IReaderResult {
    content: string
    title: string
    author: string
    date_published: string
}

interface IReader {
    read: ({ url }: { url: string }) => Promise<IReaderResult>
    blacklist: ({ url }: { url: string }) => Promise<boolean>
    whitelist: ({ url }: { url: string }) => Promise<boolean>
}

export {
    IGato,
    ISearchResult,
    IPaletteParams,
    IStatus,
    IFind,
    PaletteEvent,
    IStopFind,
    ITarget,
    IReader,
    IReaderResult,
    IPersona,
    PersonaName,
    WindowEvent,
}