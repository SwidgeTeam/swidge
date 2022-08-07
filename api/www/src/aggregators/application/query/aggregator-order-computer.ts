import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { LiFi } from '../../domain/providers/liFi';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { Aggregator } from '../../domain/aggregator';
import { AggregatorRequest } from '../../domain/aggregator-request';
import { Route } from '../../../paths/domain/route';

export class AggregatorOrderComputer {
  private readonly liFi: LiFi;

  constructor(@Inject(Class.HttpClient) private readonly httpClient: HttpClient) {
    this.liFi = LiFi.create();
  }

  public async execute(aggregatorId: string, request: AggregatorRequest): Promise<Route> {
    let aggregator: Aggregator;
    switch (aggregatorId) {
      case AggregatorProviders.LiFi:
        aggregator = this.liFi;
        break;
      default:
        throw new Error('unrecognized aggregator');
    }
    return await aggregator.execute(request);
  }

  public getEnabledAggregators(fromChain: string, toChain: string): string[] {
    const enabled = [];
    if (this.liFi.isEnabledOn(fromChain, toChain)) {
      enabled.push(AggregatorProviders.LiFi);
    }
    return enabled;
  }
}
