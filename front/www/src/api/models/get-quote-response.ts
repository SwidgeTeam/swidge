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
    callData: string
    value: string
    gasLimit: string
    gasPrice: string
}

interface RouteJson {
    amountOut: string
    tx: TransactionDetailsJson
    steps: RouteStepJson[]
}

export default interface GetQuoteResponse {
    routes: RouteJson[]
}
