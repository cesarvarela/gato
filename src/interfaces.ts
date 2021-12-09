interface ISearchResult {
    title: string
}

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
    open: ({ url }: { url: string }) => void,
    hide: () => void,
}

export { IGato, ISearchResult }