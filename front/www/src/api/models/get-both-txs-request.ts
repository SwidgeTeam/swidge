export default interface GetBothTxsRequest {
    aggregatorId: string,
    fromChainId: string,
    srcToken: string,
    toChainId: string,
    dstToken: string,
    amount: string,
    slippage: number,
    senderAddress: string,
    receiverAddress: string,
}
