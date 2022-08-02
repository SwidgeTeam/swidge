import { TokenList } from './TokenItem';

export interface TokensRepository {
  getList(): Promise<TokenList>;
}
