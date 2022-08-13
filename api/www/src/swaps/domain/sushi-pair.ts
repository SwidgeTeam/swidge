import { BigInteger } from '../../shared/domain/big-integer';
import { Token } from '../../shared/domain/token';

export class SushiPair {
  constructor(
    private readonly _id: string,
    private readonly _chainId: string,
    private readonly _token0: Token,
    private readonly _token1: Token,
    private _reserve0: BigInteger,
    private _reserve1: BigInteger,
  ) {}

  get id(): string {
    return this._id;
  }

  get chainId(): string {
    return this._chainId;
  }

  get token0(): Token {
    return this._token0;
  }

  get token1(): Token {
    return this._token1;
  }

  get reserve0(): BigInteger {
    return this._reserve0;
  }

  get reserve1(): BigInteger {
    return this._reserve1;
  }

  public updateReserve0(number: BigInteger): void {
    this._reserve0 = number;
  }
  public updateReserve1(number: BigInteger): void {
    this._reserve1 = number;
  }
}
