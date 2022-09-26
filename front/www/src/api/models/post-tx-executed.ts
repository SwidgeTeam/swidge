export interface TxExecutedRequest {
    aggregatorId: string
    fromChainId: string
    toChainId: string
    fromAddress: string
    toAddress: string
    fromToken: string
    amountIn: string
    txHash: string
    trackingId: string
}
