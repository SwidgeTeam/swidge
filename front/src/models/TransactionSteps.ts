interface TransactionStep {
    required: boolean
    completed: boolean
    tokenIn: string
    tokenOut: string
    amountIn: string
    amountOut: string
}

export interface TransactionSteps {
    origin: TransactionStep,
    bridge: TransactionStep,
    destination: TransactionStep,
    completed: boolean,
}
