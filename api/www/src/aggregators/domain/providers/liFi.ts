import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { Aggregator } from '../aggregator';
import { AggregatorOrder } from '../aggregator-order';
import { AggregatorRequest } from '../aggregator-request';

export class LiFi implements Aggregator {
  private enabledChains: string[];

  static create(httpClient: IHttpClient) {
    return new LiFi(httpClient);
  }

  constructor(private readonly httpClient: IHttpClient) {
    this.enabledChains = [];
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  execute(request: AggregatorRequest): Promise<AggregatorOrder> {
    return Promise.resolve(undefined);
  }
}
