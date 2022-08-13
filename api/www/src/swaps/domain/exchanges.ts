import { Exchange } from './exchange';
import { SwapRequest } from './swap-request';
import { SwapOrder } from './swap-order';

type Entry = [string, Exchange];

export class Exchanges {
  private readonly exchanges: Map<string, Exchange>;

  constructor(entries: Entry[]) {
    this.exchanges = new Map<string, Exchange>(entries);
  }

  /**
   * Checks which exchanges are enabled on this chain
   * @param chain
   * @return List of enabled IDs
   */
  public getEnabled(chain: string): string[] {
    const ids = [];
    for (const [id, exchange] of this.exchanges.entries()) {
      if (exchange.isEnabledOn(chain)) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Executes a requests against a specific exchange
   * @param exchangeId
   * @param request
   * @return The computed SwapOrder
   */
  public execute(exchangeId: string, request: SwapRequest): Promise<SwapOrder> {
    const exchange = this.exchanges.get(exchangeId);
    return exchange.execute(request);
  }
}
