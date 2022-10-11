export interface GetMainTxRequest {
    aggregatorId: string,
    routeId: string,
    fromChainId: string,
    srcTokenAddress: string,
    srcTokenSymbol: string,
    srcTokenDecimals: string,
    toChainId: string,
    dstTokenAddress: string,
    dstTokenSymbol: string,
    dstTokenDecimals: string,
    amount: string,
    slippage: number,
    senderAddress: string,
    receiverAddress: string,
}

export interface GetMainTxResponse {
    trackingId: string;
    tx: {
        to: string;
        value: string;
        callData: string;
        gasLimit: string;
    }
}
