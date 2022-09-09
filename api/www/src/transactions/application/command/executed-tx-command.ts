export class ExecutedTxCommand {
  constructor(
    readonly aggregatorId: string,
    readonly fromChain: string,
    readonly toChain: string,
    readonly fromAddress: string,
    readonly toAddress: string,
    readonly txHash: string,
    readonly trackingId: string,
  ) {}
}
