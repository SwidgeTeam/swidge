export interface TxExecutedRequest {
    txId: string
    aggregatorId: string
    fromChainId: string
    toChainId: string
    fromAddress: string
    toAddress: string
    fromToken: string
    toToken: string
    amountIn: string
    txHash: string
    trackingId: string
}
