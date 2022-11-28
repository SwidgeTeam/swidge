export interface TokensResponse {
  [chainId: string]: Token[]
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