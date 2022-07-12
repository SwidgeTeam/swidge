import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from '../../shared/domain/BigInteger';

export class CandidatePath {
  private readonly _originStep: SwapOrder;
  private readonly _bridgeStep: BridgingOrder;
  private readonly _destinationStep: SwapOrder;

  constructor(_originStep: SwapOrder, _bridgeStep: BridgingOrder, _destinationStep: SwapOrder) {
    this._originStep = _originStep;
    this._bridgeStep = _bridgeStep;
    this._destinationStep = _destinationStep;
  }

  get originStep(): SwapOrder {
    return this._originStep;
  }

  get bridgeStep(): BridgingOrder {
    return this._bridgeStep;
  }

  get destinationStep(): SwapOrder {
    return this._destinationStep;
  }

  get amountOut(): BigInteger {
    if (this._destinationStep.required) {
      return this._destinationStep.buyAmount;
    }
    return this._bridgeStep.amountOut;
  }
}
