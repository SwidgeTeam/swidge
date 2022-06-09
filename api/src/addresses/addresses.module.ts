import { Module } from '@nestjs/common';
import { RouterAddressFetcher } from './application/query/RouterAddressFetcher';
import { GetRouterAddressController } from './infrastructure/controllers/get-router-address.controller';
import { GetRouterAddressHandler } from './application/query/get-router-address.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { GetBridgeAddressesController } from './infrastructure/controllers/get-bridge-addresses.controller';
import { GetBridgeAddressesHandler } from './application/query/get-bridge-addresses.handler';
import addressesRepositoryProvider from './infrastructure/database/repositories/addresses.repository.provider';

@Module({
  imports: [CqrsModule],
  controllers: [GetRouterAddressController, GetBridgeAddressesController],
  providers: [
    GetRouterAddressHandler,
    GetBridgeAddressesHandler,
    RouterAddressFetcher,
    addressesRepositoryProvider(),
  ],
  exports: [RouterAddressFetcher],
})
export class AddressesModule {}
