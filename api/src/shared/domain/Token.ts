import { ContractAddress } from '../types';

export class Token {
  static null() {
    return new Token('', '0x0000000000000000000000000000000000000000', 0);
  }

  constructor(
    private readonly _name: string,
    private readonly _address: ContractAddress,
    private readonly _decimals: number,
  ) {}

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get decimals(): number {
    return this._decimals;
  }
}
