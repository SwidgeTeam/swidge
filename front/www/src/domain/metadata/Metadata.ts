import { BigNumber } from 'ethers'

export interface Metadata {
    tokens: ITokenList
    chains: IChain[]
}

export declare type ITokenList = {
    [chainId: string]: IToken[];
};

export interface IToken {
    chainId: string
    chainName: string
    address: string
    name: string
    symbol: string
    decimals: number
    logo: string
    price: string;
    balance: BigNumber;
}

export interface IChain {
    type: string;
    id: string;
    name: string;
    logo: string;
    metamask: {
        chainName: string;
        rpcUrls: string[];
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
    };
}

export interface TokenBalance {
    chainId: string;
    address: string;
    balance: BigNumber;
}
