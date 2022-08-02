import { Collection } from '../../shared/Collection';
import { TokenListItem } from './TokenListItem';

export class TokenList extends Collection {
  type() {
    return TokenListItem;
  }
}
