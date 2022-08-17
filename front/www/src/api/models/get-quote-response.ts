interface TokenDetailsJson {
    name: string
    address: string
    decimals: number
    symbol: string
}

interface RouteStepJson {
    type: string
    name: string
    logo: string
    tokenIn: TokenDetailsJson
    tokenOut: TokenDetailsJson
    amountIn: string
    amountOut: string
    fee: string
}

export interface ApprovalTransactionDetailsJson {
    to: string
    callData: string
    gasLimit: string
}

interface TransactionDetailsJson {
    to: string
    callData: string
    value: string
    gasLimit: string
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
    aggregator: AggregatorDetailsJson
    resume: RouteResumeJson
    steps: RouteStepJson[]
    tx: TransactionDetailsJson
    approvalTx: ApprovalTransactionDetailsJson | null
}

interface AggregatorDetailsJson {
    id: string
    routeId: string
    requireCallDataQuote: boolean
    trackingId: string
}

export default interface GetQuoteResponse {
    routes: RouteJson[]
}
