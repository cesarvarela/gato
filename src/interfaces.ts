interface ISearchResult {
    title: string
}

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    choose: ({ q }: { q: string }) => Promise<{ snack: string, params: Record<string, unknown> }>
    read: ({ url }: { url: string }) => Promise<{ content: string }>
    open: ({ snack, params }: { snack?: string, params?: unknown }) => void
    hide: () => void
}

export { IGato, ISearchResult }