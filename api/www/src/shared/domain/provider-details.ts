export class ProviderDetails {
  constructor(private readonly _name: string, private readonly _logo: string) {}

  get name(): string {
    return this._name;
  }

  get logo(): string {
    return this._logo;
  }
}
