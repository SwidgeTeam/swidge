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
    fee: string
}

interface RouteResume {
    fromChain: string
    toChain: string
    tokenIn: TokenDetails
    tokenOut: TokenDetails
    amountIn: string
    amountOut: string
}

export interface TransactionDetails {
    to: string
    callData: string
    value: string
    gasLimit: string
    gasPrice: string
}

export default interface Route {
    amountOut: string
    resume: RouteResume
    tx: TransactionDetails
    steps: RouteStep[]
}
