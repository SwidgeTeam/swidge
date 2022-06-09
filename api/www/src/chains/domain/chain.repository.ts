import { Chain } from './Chain';

export interface ChainRepository {
  getSupported(): Promise<Chain[]>;
}
