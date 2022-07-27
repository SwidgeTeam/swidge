import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from '../../shared/domain/BigInteger';
import { PriceFeed } from '../../shared/domain/PriceFeed';

export class Path {
  constructor(
    private readonly _originSwap: SwapOrder,
    private readonly _bridging: BridgingOrder,
    private readonly _destinationSwap: SwapOrder,
    private readonly _destinationFee: BigInteger,
    private readonly _originGasPrice: BigInteger,
    private readonly _destinationGasPrice: BigInteger,
    private readonly _priceOriginCoin: PriceFeed,
    private readonly _priceDestinationCoin: PriceFeed,
  ) {}

  get amountOut(): string {
    if (!this._bridging.required) {
      return this._originSwap.buyAmount.toDecimal(this._originSwap.tokenOut.decimals);
    }
    if (this._destinationSwap.required) {
      return this._destinationSwap.buyAmount.toDecimal(this._destinationSwap.tokenOut.decimals);
    }
    return this.bridging.amountOutDecimal;
  }

  get originSwap(): SwapOrder {
    return this._originSwap;
  }

  get bridging(): BridgingOrder {
    return this._bridging;
  }

  get destinationSwap(): SwapOrder {
    return this._destinationSwap;
  }

  get destinationFee(): BigInteger {
    return this._destinationFee;
  }

  get originFeeInUSD(): string {
    return this._originSwap.estimatedGas
      .times(this._originGasPrice)
      .times(this._priceOriginCoin.lastPrice)
      .div(BigInteger.weiInEther())
      .toDecimal(this._priceOriginCoin.decimals);
  }

  get destinationFeeInUSD(): string {
    return this._destinationSwap.estimatedGas
      .times(this._destinationGasPrice)
      .times(this._priceDestinationCoin.lastPrice)
      .div(BigInteger.weiInEther())
      .toDecimal(this._priceDestinationCoin.decimals);
  }
}
