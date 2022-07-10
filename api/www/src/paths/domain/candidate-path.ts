import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';

export class CandidatePath {
  private readonly originStep;
  private readonly bridgeStep;
  private readonly destinationStep;

  constructor(_originStep: SwapOrder, _bridgeStep: BridgingOrder, _destinationStep: SwapOrder) {
    this.originStep = _originStep;
    this.bridgeStep = _bridgeStep;
    this.destinationStep = _destinationStep;
  }
}
