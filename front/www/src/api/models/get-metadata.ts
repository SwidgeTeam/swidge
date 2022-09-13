export interface MetadataJson {
    chains: ChainListItemJson[]
    tokens: TokenListJson
}

export interface ChainListItemJson {
    t: string
    i: string
    n: string
    l: string
    m: {
        c: string
        r: string[]
        n: {
            n: string
            s: string
            d: number
        }
    }
}

export declare type TokenListJson = {
    [chainId: string]: TokenListItemJson[];
};

export interface TokenListItemJson {
    c: string
    a: string
    n: string
    s: string
    d: number
    l: string
    p: string
}
