interface ISearchResult {
    title: string
}

interface IGato {
    search: ({ q }: { q: string }) => Promise<ISearchResult[]>
}

export { IGato, ISearchResult }