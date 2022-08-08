export interface TransactionsList {
    transactions: Transaction[]
}

export interface Transaction {
    txHash: string
    status: string
    date: string
    fromChain: string
    toChain: string
    srcAsset: string
    dstAsset: string
    amountIn: string
}
