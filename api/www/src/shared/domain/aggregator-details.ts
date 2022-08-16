export class AggregatorDetails {
  constructor(
    private readonly _id: string,
    private readonly _routeId = '',
    private readonly _requiresCallDataQuoting = false,
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
}
