interface TokenDetails {
    chainId: string
    name: string
    address: string
    decimals: number
    symbol: string
    icon: string
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

interface ProviderDetails {
    name: string
    logo: string
}

export default interface Route {
    id: string
    tags: string[]
    aggregator: AggregatorDetails
    resume: RouteResume
    fees: RouteFees
    providers: ProviderDetails[]
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

export const RouteTag = {
    Cheapest: 'cheapest',
    Fastest: 'fastest',
}
