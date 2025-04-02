import electron, { MenuItemConstructorOptions } from 'electron'

interface ISearchResult {
    title: string
}

type PersonaName = 'search' | 'web' | 'read' | 'youtube' | 'find' | 'home' | 'whatsapp' | 'history' | 'alternative'

interface IPersona {
    name: PersonaName
    parse: (q: string) => Promise<IParseResult[]>
}

type IParseResult = {
    name?: PersonaName
    confidence?: Confidence,
    params?: Record<string, unknown>
    q?: string
    href: string
    label?: string
    click?: (item: any, window?: any) => void
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

interface IFinder {
    find: (params: IFind) => Promise<number>
    stopFind: ({ action }: IStopFind) => void
}

interface IStopFind {
    action: 'clearSelection' | 'keepSelection' | 'activateSelection'
}

type ITarget = '_blank' | '_self'

interface IGato {

    menu: () => Promise<{ application: { submenu: MenuItemConstructorOptions[] }, commands: MenuItemConstructorOptions[] }>,

    on: (name: string, cb: (e, params) => void) => () => void,

    reader: IReader,

    gato: Partial<IGatoWindow>,

    find: IFinder,

    youtube: IYoutube,

    search: ISearch,

    platform: string,

    ipc?: {
        invoke: (channel: string, data: any) => Promise<any>;
    };

    command: {
        executeCommand: (args: { command: string }) => Promise<void>;
    };
}

interface IReaderResult {
    content: string
    title: string
    author: string
    date_published: string
}

interface IReader {
    read: ({ url }: { url: string }) => Promise<IReaderResult>
}

interface ISearch {
    query: ({ q, start }: { q: string, start?: number }) => Promise<ISearchResult[]>
}

interface IYoutube {
    getComments: ({ v }: { v: string }) => Promise<any[]>
}

interface IGatoWindow {
    open: (params, e?) => Promise<void>
    choose: (params, e?) => Promise<IParseResult>
    status: (params?, e?) => Promise<IStatus>
    hide: (params?, e?) => Promise<void>
    show: (params, e?) => Promise<void>
    parse: (params, e?) => Promise<IParseResult[]>
}

type GatoEvents = keyof IGatoWindow

interface IWindows {
    new: (params) => Promise<void>
    reopen: (params) => Promise<void>
    duplicate: (params) => Promise<void>
    bookmark: (params) => Promise<void>
    close: (params) => Promise<void>
    back: (params) => Promise<void>
    forward: (params) => Promise<void>
    reload: (params) => Promise<void>
    openDevTools: (params) => Promise<void>
    location: (params) => Promise<void>
    find: (params) => Promise<void>
    hide: (params) => Promise<void>
    show: (params) => Promise<void>
}

type WindowEvent = keyof IWindows

type PaletteMode = "compact" | "hidden" | "full" | "find" | "location"

enum Confidence {
    None = 0,
    Low,
    Medium,
    High,
    VeryHigh,
}

export {
    IGato,
    ISearchResult,
    IStatus,
    IFind,
    IStopFind,
    ITarget,
    IReader,
    IReaderResult,
    IParseResult,
    PersonaName,
    WindowEvent,
    GatoEvents,
    IGatoWindow,
    IWindows,
    IPersona,
    IFinder,
    IYoutube,
    PaletteMode,
    ISearch,
    Confidence,
}