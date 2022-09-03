export interface MetadataJson {
    chains: ChainListItemJson[]
    tokens: TokenListItemJson[]
}

export interface ChainListItemJson {
    t: string
    i: string
    n: string
    l: string
    c: string
    d: number
    r: string[]
}

export interface TokenListItemJson {
    c: string
    a: string
    n: string
    s: string
    d: number
    l: string
    p: string
}
