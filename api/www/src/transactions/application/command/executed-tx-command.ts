export class ExecutedTxCommand {
  constructor(
    readonly txId: string,
    readonly txHash: string,
    readonly aggregatorId: string,
    readonly fromChain: string,
    readonly toChain: string,
    readonly fromAddress: string,
    readonly toAddress: string,
    readonly fromToken: string,
    readonly toToken: string,
    readonly amountIn: string,
    readonly trackingId: string,
  ) {}
}
