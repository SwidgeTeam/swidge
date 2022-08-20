import { BigInteger } from './big-integer';

export interface IGasPriceFetcher {
  fetch: (chainId: string) => Promise<BigInteger>;
}
