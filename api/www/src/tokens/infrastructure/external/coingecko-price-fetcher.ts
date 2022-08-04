import { TokenDollarValueFetcher } from '../../domain/token-dollar-value-fetcher';

export class CoingeckoPriceFetcher implements TokenDollarValueFetcher {
  fetch(id: string): Promise<number> {
    return Promise.resolve(0);
  }
}
