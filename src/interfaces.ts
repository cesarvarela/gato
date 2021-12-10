interface ISearchResult {
    title: string
}

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    open: ({ snack, params }: { snack?: string, params?: unknown }) => void,
    hide: () => void,
}

export { IGato, ISearchResult }