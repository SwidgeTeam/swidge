interface TokenDetailsJson {
    name: string,
    address: string,
    decimals: number,
    symbol: string,
}

interface RouteStepJson {
    type: string
    name: string
    logo: string
    tokenIn: TokenDetailsJson
    tokenOut: TokenDetailsJson
    amountIn: string,
    amountOut: string,
    fee: string
}

interface TransactionDetailsJson {
    to: string
    approvalAddress: string
    callData: string
    value: string
    gasLimit: string
    gasPrice: string
}

interface RouteResumeJson {
    fromChain: string
    toChain: string
    tokenIn: TokenDetailsJson
    tokenOut: TokenDetailsJson
    amountIn: string
    amountOut: string
}

interface RouteJson {
    amountOut: string
    resume: RouteResumeJson
    tx: TransactionDetailsJson
    steps: RouteStepJson[]
}

export default interface GetQuoteResponse {
    routes: RouteJson[]
}
