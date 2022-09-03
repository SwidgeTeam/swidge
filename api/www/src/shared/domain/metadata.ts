export interface IChain {
  type: string;
  id: string;
  name: string;
  logo: string;
  coin: string;
  decimals: number;
  rpcUrls: string[];
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

export interface AggregatorMetadata {
  chains: IChain[];
  tokens: IToken[];
}
