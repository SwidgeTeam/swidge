export interface WalletBalancesJson {
    tokens: TokenBalanceJson[]
}

export interface TokenBalanceJson {
    chainId: string
    address: string
    amount: string
}
