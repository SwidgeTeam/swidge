export class ExecutedTxCommand {
  constructor(
    readonly aggregatorId: string,
    readonly fromAddress: string,
    readonly toAddress: string,
    readonly txHash: string,
    readonly trackingId: string,
  ) {}
}
