export interface Metadata {
    tokens: IToken[]
    chains: IChain[]
}

export interface IToken {
    chainId: string
    chainName: string
    address: string
    name: string
    symbol: string
    decimals: number
    logo: string
    price: string;
}

export interface IChain {
    type: string;
    id: string;
    name: string;
    logo: string;
    coin: string;
    decimals: number;
    rpcUrls: string[];
}
