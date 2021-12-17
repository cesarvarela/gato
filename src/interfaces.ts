import electron, { MenuItemConstructorOptions } from 'electron'

interface ISearchResult {
    title: string
}

type PersonaName = 'search' | 'web' | 'read' | 'youtube' | 'find' | 'home'

type IPersona = {
    snack: PersonaName
    params: Record<string, unknown>
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

    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    menu: () => Promise<Record<string, MenuItemConstructorOptions>>,

    on: (channel: string, cb: (e, params) => void) => void,
    off: (channel: string, cb: (e, params) => void) => void,

    reader: IReader,

    gato: Partial<IGatoWindow>,

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
}

interface IGatoWindow {
    open: (params, e?) => Promise<void>
    choose: (params, e?) => Promise<IPersona>
    status: (params?, e?) => Promise<IStatus>
    hide: (params?, e?) => Promise<void>
    show: (params, e?) => Promise<void>
    find: (params, e?) => Promise<number>
    stopFind: (params, e?) => Promise<void>
}

type GatoEvents = keyof IGatoWindow

interface IWindows {
    new: (params) => Promise<void>
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

export {
    IGato,
    ISearchResult,
    IStatus,
    IFind,
    IStopFind,
    ITarget,
    IReader,
    IReaderResult,
    IPersona,
    PersonaName,
    WindowEvent,
    GatoEvents,
    IGatoWindow,
    IWindows,
}