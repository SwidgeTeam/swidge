import { Bridge } from './bridge';
import { BridgingRequest } from './bridging-request';
import { BridgingOrder } from './bridging-order';

type Entry = [string, Bridge];

export class Bridges {
  private readonly bridges: Map<string, Bridge>;

  constructor(entries: Entry[]) {
    this.bridges = new Map<string, Bridge>(entries);
  }

  /**
   * Checks which bridges are enabled on this chains
   * @param fromChain
   * @param toChain
   * @return List of enabled IDs
   */
  public getEnabled(fromChain: string, toChain: string): string[] {
    const ids = [];
    for (const [id, bridge] of this.bridges.entries()) {
      if (bridge.isEnabledOn(fromChain, toChain)) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Executes a requests against a specific bridge
   * @param bridgeId
   * @param request
   * @return The computed BridgingOrder
   */
  public execute(bridgeId: string, request: BridgingRequest): Promise<BridgingOrder> {
    const bridge = this.bridges.get(bridgeId);
    return bridge.execute(request);
  }
}
