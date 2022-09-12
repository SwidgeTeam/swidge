export interface IChain {
  type: string;
  id: string;
  name: string;
  logo: string;
  metamask: {
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
  };
}

export interface IToken {
  chainId: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  price: string;
}

export declare type ITokenList = {
  [chainId: string]: IToken[];
};

export interface AggregatorMetadata {
  chains: IChain[];
  tokens: ITokenList;
}
