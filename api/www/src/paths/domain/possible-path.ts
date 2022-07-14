import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from '../../shared/domain/BigInteger';

export class PossiblePath {
  private readonly _bridgingAsset: string;
  private readonly _originStep: SwapOrder;
  private readonly _bridgeSteps: BridgingOrder[];

  constructor(asset: string, originStep: SwapOrder) {
    this._bridgingAsset = asset;
    this._originStep = originStep;
    this._bridgeSteps = [];
  }

  get bridgingAsset(): string {
    return this._bridgingAsset;
  }

  get originSwapRequired(): boolean {
    return this._originStep.required;
  }

  get originSwapAmountOut(): BigInteger {
    return this._originStep.buyAmount;
  }

  get originSwap(): SwapOrder {
    return this._originStep;
  }

  get bridgeSteps(): BridgingOrder[] {
    return this._bridgeSteps;
  }

  public withBridge(bridgeOrder: BridgingOrder) {
    this._bridgeSteps.push(bridgeOrder);
  }
}
