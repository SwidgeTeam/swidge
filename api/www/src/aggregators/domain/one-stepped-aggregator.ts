import { Aggregator } from './aggregator';
import { AggregatorRequest } from './aggregator-request';
import BothTxs from './both-txs';

export interface OneSteppedAggregator extends Aggregator {
  buildTxs: (request: AggregatorRequest) => Promise<BothTxs>;
}
