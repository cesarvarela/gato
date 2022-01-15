import electron, { MenuItemConstructorOptions } from 'electron'

interface ISearchResult {
    title: string
}

type PersonaName = 'search' | 'web' | 'read' | 'youtube' | 'find' | 'home' | 'whatsapp' | 'history'

interface IPersona {
    name: PersonaName
    parse: (q: string) => Promise<IParseResult[]>
}

type IParseResult = {
    name?: PersonaName
    confidence?: number
    params?: Record<string, unknown>
    href: string
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

    menu: () => Promise<Record<string, MenuItemConstructorOptions>>,

    on: (name: string, cb: (e, params) => void) => () => void,

    reader: IReader,

    gato: Partial<IGatoWindow>,

    find: IFinder,

    youtube: IYoutube,

    search: ISearch,

    platform: string,
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
    getComments: ({ v: string }) => Promise<any[]>
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
}