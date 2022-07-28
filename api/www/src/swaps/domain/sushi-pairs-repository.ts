import { SushiPair } from './sushi-pair';
import { SushiPairs } from './sushi-pairs';

export interface SushiPairsRepository {
  getPairs(chainId: string): Promise<SushiPairs>;

  getOutdatedPairs(): Promise<SushiPairs>;

  save(pair: SushiPair): void;
}
