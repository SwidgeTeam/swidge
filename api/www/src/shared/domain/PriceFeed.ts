import { BigInteger } from './big-integer';

export class PriceFeed {
  public static zero(): PriceFeed {
    return new PriceFeed(BigInteger.zero(), 0);
  }

  constructor(private readonly _lastPrice: BigInteger, private readonly _decimals: number) {}

  get lastPrice(): BigInteger {
    return this._lastPrice;
  }

  get decimals(): number {
    return this._decimals;
  }
}
