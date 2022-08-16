export default class BuildTxApprovalQuery {
  constructor(
    readonly aggregatorId: string,
    readonly routeId: string,
    readonly senderAddress: string,
  ) {}
}
