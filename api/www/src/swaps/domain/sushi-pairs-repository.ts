import { SushiPair } from './sushi-pair';

export interface SushiPairsRepository {
  getPairs(chainId: string): Promise<SushiPair[]>;

  getAllPairs(): Promise<SushiPair[]>;

  update(pair: SushiPair): void;

  save(pair: SushiPair): void;
}
