import { BridgingRequest } from './bridging-request';
import { BridgingOrder } from './bridging-order';

export interface Bridge {
  execute: (request: BridgingRequest) => Promise<BridgingOrder>;
}
