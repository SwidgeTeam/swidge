export interface MetadataResponse {
  chains: Chain[]
  tokens: {
    [chainId: string]: Token[]
  }
}

export interface Chain {
  chain_type: string
  chain_id: string
  name: string
  logo: string
}

export interface Token {
  chain_id: string
  address: string
  name: string
  symbol: string
  decimals: number
  logo: string
  price: string
}