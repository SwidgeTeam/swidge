export class AggregatorDetails {
  constructor(
    private readonly _id: string,
    private readonly _routeId = '',
    private readonly _requiresCallDataQuoting = false,
    private readonly _bothQuotesInOne = false,
    private readonly _trackingId = '',
  ) {}

  get id(): string {
    return this._id;
  }

  get routeId(): string {
    return this._routeId;
  }

  get requiresCallDataQuoting(): boolean {
    return this._requiresCallDataQuoting;
  }

  get bothQuotesInOne(): boolean {
    return this._bothQuotesInOne;
  }

  get trackingId(): string {
    return this._trackingId;
  }
}
