import { BridgingRequest } from './BridgingRequest';
import { BridgingOrder } from './BridgingOrder';

export interface Bridge {
  execute: (request: BridgingRequest) => Promise<BridgingOrder>;
}
