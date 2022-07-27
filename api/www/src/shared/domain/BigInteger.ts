import { BigNumber, ethers } from 'ethers';

export class BigInteger {
  private readonly _number: BigNumber;

  static defaultDecimals = 18;

  static fromDecimal(value: string, decimals?: number) {
    if (!decimals) {
      decimals = BigInteger.defaultDecimals;
    }
    const number = ethers.utils.parseUnits(value, decimals);
    return new BigInteger(number);
  }

  static fromString(value: string) {
    const number = BigNumber.from(value);
    return new BigInteger(number);
  }

  static fromBigNumber(value: BigNumber) {
    return new BigInteger(value);
  }

  static zero() {
    const number = BigNumber.from(0);
    return new BigInteger(number);
  }

  private constructor(number: BigNumber) {
    this._number = number;
  }

  public plus(other: BigInteger): BigInteger {
    return new BigInteger(this._number.add(other._number));
  }

  public minus(other: BigInteger): BigInteger {
    return new BigInteger(this._number.sub(other._number));
  }

  public times(amount: BigInteger | number): BigInteger {
    const other = typeof amount === 'number' ? amount : amount._number;
    return new BigInteger(this._number.mul(other));
  }

  public div(amount: BigInteger | number): BigInteger {
    const other = typeof amount === 'number' ? amount : amount._number;
    return new BigInteger(this._number.div(other));
  }

  public lessThan(other: BigInteger) {
    return this._number.lt(other._number);
  }

  public greaterThan(other: BigInteger) {
    return this._number.gt(other._number);
  }

  public isNegative(): boolean {
    return this._number.isNegative();
  }

  public toString(): string {
    return this._number.toString();
  }

  public toDecimal(decimals?: number): string {
    if (!decimals) {
      decimals = BigInteger.defaultDecimals;
    }
    return ethers.utils.formatUnits(this._number, decimals);
  }

  public convertDecimalsFromTo(fromDecimals: number, toDecimals: number): BigInteger {
    let num;
    if (fromDecimals < toDecimals) {
      num = this._number.mul(10 ** (toDecimals - fromDecimals));
    } else {
      num = this._number.div(10 ** (fromDecimals - toDecimals));
    }
    return new BigInteger(num);
  }
}
