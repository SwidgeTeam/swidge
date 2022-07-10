import { Module } from '@nestjs/common';
import { BridgeOrderComputer } from './application/query/bridge-order-computer';
import httpClientProvider from '../shared/http/httpClient.provider';

@Module({
  providers: [BridgeOrderComputer, httpClientProvider()],
  exports: [BridgeOrderComputer],
})
export class BridgesModule {}
