import { ContractAddress } from '../../shared/types';
import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/BridgingOrder';

export class Path {
  constructor(
    private readonly _router: ContractAddress,
    private readonly _originSwap: SwapOrder,
    private readonly _bridging: BridgingOrder,
    private readonly _destinationSwap: SwapOrder,
  ) {}

  get router(): ContractAddress {
    return this._router;
  }

  get amountOut(): string {
    if (this._bridging.required) {
      if (this._destinationSwap.required) {
        return this._destinationSwap.buyAmount.toDecimal(
          this._destinationSwap.tokenOut.decimals,
        );
      } else {
        return this.bridging.amountOutDecimal;
      }
    } else {
      return this._originSwap.buyAmount.toDecimal(
        this._originSwap.tokenOut.decimals,
      );
    }
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
}
