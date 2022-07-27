import { BridgingFees } from './BridgingFees';
import { BridgingLimits } from './BridgingLimits';
import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';

export class BridgingOrder {
  static notRequired() {
    return new BridgingOrder(
      null,
      Token.null(),
      Token.null(),
      '0',
      '0x',
      null,
      null,
      false,
    );
  }

  constructor(
    private readonly _amountIn: BigInteger,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _toChainId: string,
    private readonly _data: string,
    private readonly _fees: BridgingFees,
    private readonly _limits: BridgingLimits,
    private readonly _required: boolean,
  ) {}

  get tokenIn(): Token {
    return this._tokenIn;
  }

  get tokenOut(): Token {
    return this._tokenOut;
  }

  get toChainId(): string {
    return this._toChainId;
  }

  get data(): string {
    return this._data;
  }

  get bigAmountThreshold(): BigInteger {
    return this._limits.bigAmountThreshold;
  }

  get required(): boolean {
    return this._required;
  }

  get amountOut(): BigInteger {
    const convertedAmount = this._amountIn.convertDecimalsFromTo(
      this._tokenIn.decimals,
      this._fees.decimals,
    );
    const bridgingFee = this.finalFee(convertedAmount);
    return convertedAmount.minus(bridgingFee);
  }

  get amountOutDecimal(): string {
    if (this._required) {
      return this.amountOut.toDecimal(this._tokenOut.decimals);
    } else {
      return '';
    }
  }

  get fee(): BigInteger {
    const convertedAmount = this._amountIn.convertDecimalsFromTo(
      this._tokenIn.decimals,
      this._fees.decimals,
    );
    return this.finalFee(convertedAmount);
  }

  private finalFee(crossAmount: BigInteger): BigInteger {
    // Compute the given percentage
    let fee = crossAmount.times(this._fees.percentageFee * 100).div(100 * 100);
    if (fee.lessThan(this._fees.minimumFee)) {
      // Check if fees are lower than minimum
      fee = this._fees.minimumFee;
    } else if (fee.greaterThan(this._fees.maximumFee)) {
      // Or higher than maximum
      fee = this._fees.maximumFee;
    }
    return fee;
  }
}
