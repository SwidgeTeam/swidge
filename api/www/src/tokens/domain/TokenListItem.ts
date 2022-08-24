import { ContractAddress } from '../../shared/types';

export class TokenListItem {
  constructor(
    private readonly _chainId: string,
    private readonly _address: ContractAddress,
    private readonly _name: string,
    private readonly _decimals: number,
    private readonly _symbol: string,
    private _logoURL: string,
    private _price = 0,
    private _coingeckoId = '',
    private _coinmarketcapId = '',
  ) {}

  get chainId(): string {
    return this._chainId;
  }

  get address(): ContractAddress {
    return this._address;
  }

  get name(): string {
    return this._name;
  }

  get decimals(): number {
    return this._decimals;
  }

  get symbol(): string {
    return this._symbol;
  }

  get logoURL(): string {
    return this._logoURL;
  }

  get coingeckoId(): string {
    return this._coingeckoId;
  }

  get coinmarketcapId(): string {
    return this._coinmarketcapId;
  }

  get price(): number {
    return this._price;
  }

  public setLogo(logo: string): TokenListItem {
    this._logoURL = logo;
    return this;
  }

  public setExternalId(id: string): TokenListItem {
    this._coingeckoId = id;
    return this;
  }

  public setPrice(price: number): TokenListItem {
    this._price = price;
    return this;
  }
}
