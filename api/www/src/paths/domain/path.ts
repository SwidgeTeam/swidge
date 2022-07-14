import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigNumber } from 'ethers';

export class Path {
  constructor(
    private readonly _originSwap: SwapOrder,
    private readonly _bridging: BridgingOrder,
    private readonly _destinationSwap: SwapOrder,
    private readonly _destinationFee: BigNumber,
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

  get destinationFee(): BigNumber {
    return this._destinationFee;
  }
}
