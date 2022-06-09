import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AddressesRepository } from '../../domain/AddressesRepository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { GetBridgeAddressesQuery } from './get-bridge-addresses.query';
import { Addresses } from '../../domain/Addresses';

@QueryHandler(GetBridgeAddressesQuery)
export class GetBridgeAddressesHandler
  implements IQueryHandler<GetBridgeAddressesQuery>
{
  constructor(
    @Inject(Class.AddressesRepository)
    private readonly addressRepository: AddressesRepository,
  ) {}

  execute(query: GetBridgeAddressesQuery): Promise<Addresses> {
    return this.addressRepository.getAllBridgeAddresses(query.type);
  }
}
