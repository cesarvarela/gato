interface ISearchResult {
    title: string
}

type PaletteMode = 'location' | 'default' | 'find' | 'hide'

interface IPaletteParams {
    mode: PaletteMode
}

interface IStatus {
    url: { href: string }
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

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    choose: ({ q }: { q: string }) => Promise<{ snack: string, params: Record<string, unknown> }>
    read: ({ url }: { url: string }) => Promise<{ content: string, title: string, author: string, date_published: string }>
    open: ({ snack, params }: { snack?: string, params?: unknown }) => void
    hide: () => void,
    show: () => void,
    on: (channel: string, cb: (e, params) => void) => void,
    status: () => Promise<IStatus>,
    find: (params: IFind) => Promise<number>,
    stopFind: (params?: IStopFind) => Promise<void>,
}

export { IGato, ISearchResult, IPaletteParams, IStatus, IFind, PaletteMode, IStopFind }