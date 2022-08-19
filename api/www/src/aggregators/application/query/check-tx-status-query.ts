export default class CheckTxStatusQuery {
  constructor(
    readonly aggregatorId: string,
    readonly fromChain: string,
    readonly toChain: string,
    readonly txHash: string,
    readonly trackingId: string,
  ) {}
}
