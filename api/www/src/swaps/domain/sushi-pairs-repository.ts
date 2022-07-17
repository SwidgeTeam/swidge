import { SushiPair } from './sushi-pair';
import { SushiPairs } from './sushi-pairs';

export interface SushiPairsRepository {
  getPairs(chainId: string): Promise<SushiPairs>;

  getAllPairs(): Promise<SushiPairs>;

  update(pair: SushiPair): void;

  save(pair: SushiPair): void;
}
