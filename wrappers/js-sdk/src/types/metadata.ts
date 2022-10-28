export interface Metadata {
  chains: Chains
  tokens: Tokens
}

export type Chains = Chain[]

export interface Chain {
  type: string
  id: string
  name: string
  logo: string
}

export interface Tokens {
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