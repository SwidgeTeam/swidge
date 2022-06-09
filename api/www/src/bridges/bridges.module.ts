import { Module } from '@nestjs/common';
import { GetBridgingOrder } from './application/query/get-bridging-order';
import httpClientProvider from '../shared/http/httpClient.provider';

@Module({
  providers: [GetBridgingOrder, httpClientProvider()],
  exports: [GetBridgingOrder],
})
export class BridgesModule {}
