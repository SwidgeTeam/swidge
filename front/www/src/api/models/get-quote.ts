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

interface RouteFeesJson {
    amount: string
    amountInUsd: string
}

interface RouteJson {
    amountOut: string
    aggregator: AggregatorDetailsJson
    resume: RouteResumeJson
    steps: RouteStepJson[]
    fees: RouteFeesJson
    approvalTx: ApprovalTransactionDetailsJson | null
    mainTx: TransactionDetailsJson | null
}

interface AggregatorDetailsJson {
    id: string
    routeId: string
    requiresCallDataQuoting: boolean
    bothQuotesInOne: boolean
    trackingId: string
}

export interface GetQuoteResponse {
    routes: RouteJson[]
}

export interface GetQuoteRequest {
    fromChainId: string
    srcToken: string,
    toChainId: string
    dstToken: string,
    amount: string
    slippage: number,
    senderAddress: string,
    receiverAddress: string,
}

export const indexedErrors: { [errorKey: string]: string } = {
    TOO_BIG_AMOUNT: 'Too big amount',
    TOO_SMALL_AMOUNT: 'Too small amount',
    PATH_NOT_FOUND: 'Insufficient liquidity'
}
