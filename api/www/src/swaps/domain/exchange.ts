import { SwapOrder } from './SwapOrder';
import { SwapRequest } from './SwapRequest';

export interface Exchange {
  execute: (request: SwapRequest) => Promise<SwapOrder>;

  isEnabledOn: (chainId: string) => boolean;
}
