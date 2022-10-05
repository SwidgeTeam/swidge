export interface TransactionsListJson {
    transactions: TransactionJson[]
}

export interface TransactionJson {
    originTxHash: string
    destinationTxHash: string
    status: string
    date: string
    fromChain: string
    toChain: string
    srcAsset: string
    dstAsset: string
    amountIn: string
    amountOut: string
}
