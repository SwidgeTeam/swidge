export default class BuildTxQuery {
  constructor(
    readonly aggregatorId: string,
    readonly routeId: string,
    readonly senderAddress: string,
    readonly receiverAddress: string,
  ) {}
}
