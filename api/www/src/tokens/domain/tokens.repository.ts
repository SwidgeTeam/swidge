import { TokenList } from './TokenItem';
import { TokenListItem } from './TokenListItem';

export interface TokensRepository {
  getList(): Promise<TokenList>;

  find(chainId: string, address: string): Promise<TokenListItem | null>;

  save(token: TokenListItem): void;
}
