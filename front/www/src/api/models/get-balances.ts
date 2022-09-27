export interface WalletBalancesJson {
    empty: boolean
    tokens: TokenBalanceJson[]
}

export interface TokenBalanceJson {
    chainId: string
    address: string
    amount: string
}
