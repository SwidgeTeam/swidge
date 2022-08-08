interface TokenDetails {
    name: string,
    address: string,
}

interface RouteStep {
    type: string
    name: string
    logo: string
    tokenIn: TokenDetails
    tokenOut: TokenDetails
    fee: string
}

interface TransactionDetails {
    to: string
    callData: string
    value: string
    gasLimit: string
    gasPrice: string
}

export default interface Route {
    amountOut: string
    tx: TransactionDetails
    steps: RouteStep[]
}
