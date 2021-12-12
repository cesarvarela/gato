interface ISearchResult {
    title: string
}

interface IPaletteParams {
    mode: 'location' | 'default'
}

interface IStatus {
    url: { href: string }
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
}

export { IGato, ISearchResult, IPaletteParams, IStatus }