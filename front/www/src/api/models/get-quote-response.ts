interface TokenDetails {
    name: string,
    address: string,
}

export default interface GetQuoteResponse {
    router: string,
    amountOut: string,
    originSwap: {
        code: string,
        tokenIn: TokenDetails,
        tokenOut: TokenDetails,
        data: string,
        amountOut: string,
        required: boolean
    },
    bridge: {
        tokenIn: TokenDetails,
        tokenOut: TokenDetails,
        toChainId: string,
        data: string,
        required: boolean,
        amountOut: string,
    },
    destinationSwap: {
        tokenIn: TokenDetails,
        tokenOut: TokenDetails,
        required: boolean
    }
}
