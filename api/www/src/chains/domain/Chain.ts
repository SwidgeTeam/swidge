export class Chain {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _chainId: string;

  constructor(id: string, name: string, chainId: string) {
    this._id = id;
    this._name = name;
    this._chainId = chainId;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get chainId(): string {
    return this._chainId;
  }
}
