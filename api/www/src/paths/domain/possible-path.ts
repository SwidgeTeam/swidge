import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { BigInteger } from '../../shared/domain/BigInteger';

export class PossiblePath {
  private readonly _bridgingAsset: string;
  private readonly _originStep: SwapOrder;
  private readonly _bridgeSteps: Map<string, BridgingOrder>;

  constructor(asset: string, originStep: SwapOrder) {
    this._bridgingAsset = asset;
    this._originStep = originStep;
    this._bridgeSteps = new Map<string, BridgingOrder>();
  }

  get bridgingAsset(): string {
    return this._bridgingAsset;
  }

  get originSwapAmountOut(): BigInteger {
    return this._originStep.buyAmount;
  }

  public withBridge(bridgeId: string, bridgeOrder: BridgingOrder) {
    this._bridgeSteps.set(bridgeId, bridgeOrder);
  }

  public forEachBridge(callback: (originSwap: SwapOrder, bridgeOrder: BridgingOrder) => void) {
    this._bridgeSteps.forEach((bridgeOrder: BridgingOrder) => {
      callback(this._originStep, bridgeOrder);
    });
  }
}
