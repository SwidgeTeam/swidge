export default class BuildMainTxQuery {
  constructor(
    readonly aggregatorId: string,
    readonly routeId: string,
    readonly senderAddress: string,
    readonly receiverAddress: string,
  ) {}
}
