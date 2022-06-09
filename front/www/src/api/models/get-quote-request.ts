export default interface GetQuoteRequest {
    fromChainId: string
    srcToken: string,
    toChainId: string
    dstToken: string,
    amount: string
}
