interface TokenDetails {
    name: string
    address: string
    decimals: number
    symbol: string
}

export interface RouteStep {
    type: string
    name: string
    logo: string
    tokenIn: TokenDetails
    tokenOut: TokenDetails
    amountIn: string
    amountOut: string
    fee: string
    completed: boolean
}

interface RouteResume {
    fromChain: string
    toChain: string
    tokenIn: TokenDetails
    tokenOut: TokenDetails
    amountIn: string
    amountOut: string
}

export interface ApprovalTransactionDetails {
    to: string
    callData: string
    gasLimit: string
}

export interface TransactionDetails {
    to: string
    callData: string
    value: string
    gasLimit: string
}

export default interface Route {
    aggregator: AggregatorDetails
    resume: RouteResume
    steps: RouteStep[]
    approvalTx?: ApprovalTransactionDetails
    tx?: TransactionDetails
    completed: boolean
}

interface AggregatorDetails {
    id: string
    routeId: string
    requireCallDataQuote: boolean
}
