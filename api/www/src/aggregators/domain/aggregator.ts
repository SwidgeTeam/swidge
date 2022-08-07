import { AggregatorOrder } from './aggregator-order';
import { AggregatorRequest } from './aggregator-request';

export interface Aggregator {
  isEnabledOn: (fromChainId: string, toChainId: string) => boolean;

  execute: (request: AggregatorRequest) => Promise<AggregatorOrder>;
}
