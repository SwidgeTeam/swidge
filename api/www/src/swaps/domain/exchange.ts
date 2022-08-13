import { SwapOrder } from './swap-order';
import { SwapRequest } from './swap-request';

export interface Exchange {
  execute: (request: SwapRequest) => Promise<SwapOrder>;

  isEnabledOn: (chainId: string) => boolean;
}
