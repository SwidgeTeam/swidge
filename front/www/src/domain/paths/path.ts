interface TokenDetails {
    chainId: string
    name: string
    address: string
    decimals: number
    symbol: string
    icon: string
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
    executionTime: number
    completed: boolean
}

interface RouteResume {
    fromChain: string
    toChain: string
    tokenIn: TokenDetails
    tokenOut: TokenDetails
    amountIn: string
    amountOut: string
    executionTime: number
}

interface RouteFees {
    amount: string,
    amountInUsd: string
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
    id: string
    tag: string
    aggregator: AggregatorDetails
    resume: RouteResume
    steps: RouteStep[]
    fees: RouteFees
    approvalTx?: ApprovalTransactionDetails
    tx?: TransactionDetails
    completed: boolean
}

interface AggregatorDetails {
    id: string
    routeId: string
    requiresCallDataQuoting: boolean
    bothQuotesInOne: boolean
    trackingId: string
}
