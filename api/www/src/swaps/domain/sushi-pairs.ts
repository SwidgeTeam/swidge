import { Collection } from '../../shared/Collection';
import { SushiPair } from './sushi-pair';

export class SushiPairs extends Collection {
  type() {
    return SushiPair;
  }
}
