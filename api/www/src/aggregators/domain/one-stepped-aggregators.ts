import { OneSteppedAggregator } from './one-stepped-aggregator';

type Entry = [string, OneSteppedAggregator];

export class OneSteppedAggregators {
  private readonly oneSteppedAggregators: Map<string, OneSteppedAggregator>;

  constructor(entries: Entry[]) {
    this.oneSteppedAggregators = new Map<string, OneSteppedAggregator>(entries);
  }

  /**
   * Returns a specific aggregator by ID
   * @param aggregatorId
   */
  public get(aggregatorId: string): OneSteppedAggregator {
    return this.oneSteppedAggregators.get(aggregatorId);
  }
}
