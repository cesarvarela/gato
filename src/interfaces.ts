interface ISearchResult {
    title: string
}

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    read: ({ url }: { url: string }) => Promise<{ content: string }>
    open: ({ snack, params }: { snack?: string, params?: unknown }) => void,
    hide: () => void,
}

export { IGato, ISearchResult }