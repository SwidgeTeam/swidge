import { ContractAddress } from '../types';
import { NATIVE_TOKEN_ADDRESS } from '../enums/Natives';

export class Token {
  static null() {
    return new Token('', '', '0x0000000000000000000000000000000000000000', 0, '');
  }

  constructor(
    private readonly _chainId: string,
    private readonly _name: string,
    private readonly _address: ContractAddress,
    private readonly _decimals: number,
    private readonly _symbol: string,
  ) {}

  get chainId(): string {
    return this._chainId;
  }

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get decimals(): number {
    return this._decimals;
  }

  get symbol(): string {
    return this._symbol;
  }

  public equals(other: Token): boolean {
    return this._address.toLowerCase() === other.address.toLowerCase();
  }

  public isNative(): boolean {
    return this._address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
  }
}
