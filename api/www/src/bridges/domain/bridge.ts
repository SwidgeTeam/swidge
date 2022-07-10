import { BridgingRequest } from './bridging-request';
import { BridgingOrder } from './BridgingOrder';

export interface Bridge {
  execute: (request: BridgingRequest) => Promise<BridgingOrder>;
}
