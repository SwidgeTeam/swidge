import { BridgingFees } from './BridgingFees';
import { BridgingLimits } from './BridgingLimits';
import { Token } from '../../shared/domain/token';
import { BigInteger } from '../../shared/domain/big-integer';

export class BridgingOrder {
  static notRequired() {
    return new BridgingOrder(
      BigInteger.zero(),
      BigInteger.zero(),
      Token.null(),
      Token.null(),
      '0',
      '0x',
      null,
      null,
      0,
      false,
    );
  }

  constructor(
    private readonly _expectedAmountIn: BigInteger,
    private readonly _worstCaseAmountIn: BigInteger,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _toChainId: string,
    private readonly _data: string,
    private readonly _fees: BridgingFees,
    private readonly _limits: BridgingLimits,
    private readonly _executionTime: number,
    private readonly _required = true,
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

  get amountIn(): BigInteger {
    return this._expectedAmountIn;
  }

  get executionTime(): number {
    return this._executionTime;
  }

  get expectedAmountOut(): BigInteger {
    const convertedAmount = this._expectedAmountIn.convertDecimalsFromTo(
      this._tokenIn.decimals,
      this._fees.decimals,
    );
    const bridgingFee = this.finalFee(convertedAmount);
    return convertedAmount.minus(bridgingFee);
  }

  get worstCaseAmountOut(): BigInteger {
    const convertedAmount = this._worstCaseAmountIn.convertDecimalsFromTo(
      this._tokenIn.decimals,
      this._fees.decimals,
    );
    const bridgingFee = this.finalFee(convertedAmount);
    return convertedAmount.minus(bridgingFee);
  }

  get fee(): BigInteger {
    const convertedAmount = this._expectedAmountIn.convertDecimalsFromTo(
      this._tokenIn.decimals,
      this._fees.decimals,
    );
    return this.finalFee(convertedAmount);
  }

  get decimalFee(): string {
    if (this._required) {
      return this.fee.toDecimal(this.tokenOut.decimals);
    } else {
      return '';
    }
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
