import { Aggregator } from './aggregator';
import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route';

type Entry = [string, Aggregator];

export class Aggregators {
  private readonly aggregators: Map<string, Aggregator>;

  constructor(entries: Entry[]) {
    this.aggregators = new Map<string, Aggregator>(entries);
  }

  /**
   * Checks which aggregators are enabled on this chains
   * @param fromChain
   * @param toChain
   * @return List of enabled IDs
   */
  public getEnabled(fromChain: string, toChain: string): string[] {
    const ids = [];
    for (const [id, aggregator] of this.aggregators.entries()) {
      if (aggregator.isEnabledOn(fromChain, toChain)) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Executes a requests against a specific aggregator
   * @param aggregatorId
   * @param request
   * @return The computed BridgingOrder
   */
  public execute(aggregatorId: string, request: AggregatorRequest): Promise<Route> {
    const aggregator = this.aggregators.get(aggregatorId);
    return aggregator.execute(request);
  }
}
