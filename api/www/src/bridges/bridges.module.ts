import { Module } from '@nestjs/common';
import { BridgeOrderComputer } from './application/query/bridge-order-computer';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import cachedHttpClientProvider from '../shared/infrastructure/http/cachedHttpClient.provider';

@Module({
  providers: [BridgeOrderComputer, httpClientProvider(), cachedHttpClientProvider()],
  exports: [BridgeOrderComputer],
})
export class BridgesModule {}
