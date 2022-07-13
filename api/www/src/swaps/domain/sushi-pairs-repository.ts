import { Pair } from '@sushiswap/sdk';

export interface SushiPairsRepository {
  getPairs(chainId: string): Promise<Pair[]>;
}
