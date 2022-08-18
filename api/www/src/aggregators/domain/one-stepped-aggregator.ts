import { AggregatorRequest } from './aggregator-request';
import BothTxs from './both-txs';

export interface OneSteppedAggregator {
  buildTxs: (request: AggregatorRequest) => Promise<BothTxs>;
}
