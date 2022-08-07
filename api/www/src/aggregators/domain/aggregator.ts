import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route';

export interface Aggregator {
  isEnabledOn: (fromChainId: string, toChainId: string) => boolean;

  execute: (request: AggregatorRequest) => Promise<Route>;
}
