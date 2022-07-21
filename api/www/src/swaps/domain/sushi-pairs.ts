import { Collection } from '../../shared/Collection';
import { SushiPair } from './sushi-pair';
import { Token } from '../../shared/domain/Token';

export class SushiPairs extends Collection {
  type() {
    return SushiPair;
  }

  public contains(token: Token): boolean {
    const total = this.items<SushiPair[]>().filter((pair) => {
      return pair.token0.equals(token) || pair.token1.equals(token);
    });
    return total.length > 0;
  }

  public add(pairs: SushiPairs): SushiPairs {
    const finalItems = this.items<SushiPair[]>().concat(pairs.items());
    return new SushiPairs(finalItems);
  }
}
