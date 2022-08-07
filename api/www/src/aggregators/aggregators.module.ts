import { Module } from '@nestjs/common';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import { AggregatorOrderComputer } from './application/query/aggregator-order-computer';

@Module({
  providers: [AggregatorOrderComputer, httpClientProvider()],
  exports: [AggregatorOrderComputer],
})
export class AggregatorsModule {}
