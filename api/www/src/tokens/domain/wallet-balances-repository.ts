import { WalletBalances } from './wallet-balances';

export interface WalletBalancesRepository {
  getTokenList: (wallet: string) => Promise<WalletBalances>;
}
