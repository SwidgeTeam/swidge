import { Collection } from '../../shared/Collection';
import { TokenListItem } from './TokenListItem';

export class TokenList extends Collection {
  type() {
    return TokenListItem;
  }

  find(chainId: string, address: string): TokenListItem {
    for (const token of this.items<TokenListItem[]>()) {
      if (token.chainId === chainId && token.address === address) {
        return token;
      }
    }
    return null;
  }
}
