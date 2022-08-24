import { Collection } from '../../shared/Collection';
import { TokenListItem } from './TokenListItem';
import { NATIVE_TOKEN_ADDRESS } from '../../shared/enums/Natives';

export class TokenList extends Collection {
  type() {
    return TokenListItem;
  }

  find(chainId: string, address: string): TokenListItem {
    for (const token of this.items<TokenListItem[]>()) {
      if (token.chainId === chainId && token.address.toLowerCase() === address.toLowerCase()) {
        return token;
      }
    }
    return null;
  }

  findByExternalId(id: string): TokenListItem {
    for (const token of this.items<TokenListItem[]>()) {
      if (token.coingeckoId === id) {
        return token;
      }
    }
    return null;
  }

  ofChain(chainId: string): TokenList {
    const items = [];
    for (const token of this.items<TokenListItem[]>()) {
      if (token.chainId === chainId) {
        items.push(token);
      }
    }
    return new TokenList(items);
  }

  getNatives(): TokenList {
    const items = [];
    for (const token of this.items<TokenListItem[]>()) {
      if (token.address === NATIVE_TOKEN_ADDRESS) {
        items.push(token);
      }
    }
    return new TokenList(items);
  }

  updateTokenPrice(chainId: string, address: string, price: number): void {
    const token = this.find(chainId, address);
    token.setPrice(price);
  }

  withoutPrice(): TokenList {
    const items = [];
    for (const token of this.items<TokenListItem[]>()) {
      if (token.price === 0) {
        items.push(token);
      }
    }
    return new TokenList(items);
  }
}
