import { TwoSteppedAggregator } from './two-stepped-aggregator';

type Entry = [string, TwoSteppedAggregator];

export class TwoSteppedAggregators {
  private readonly twoSteppedAggregators: Map<string, TwoSteppedAggregator>;

  constructor(entries: Entry[]) {
    this.twoSteppedAggregators = new Map<string, TwoSteppedAggregator>(entries);
  }

  /**
   * Returns a specific aggregator by ID
   * @return A stepped aggregator
   * @param aggregatorId
   */
  public get(aggregatorId: string): TwoSteppedAggregator {
    return this.twoSteppedAggregators.get(aggregatorId);
  }
}
