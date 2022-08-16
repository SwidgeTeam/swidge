import { SteppedAggregator } from './stepped-aggregator';

type Entry = [string, SteppedAggregator];

export class SteppedAggregators {
  private readonly steppedAggregators: Map<string, SteppedAggregator>;

  constructor(entries: Entry[]) {
    this.steppedAggregators = new Map<string, SteppedAggregator>(entries);
  }

  /**
   * Returns a specific aggregator by ID
   * @return A stepped aggregator
   * @param aggregatorId
   */
  public get(aggregatorId: string): SteppedAggregator {
    return this.steppedAggregators.get(aggregatorId);
  }
}
