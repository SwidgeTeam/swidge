import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRouterAddressQuery } from './get-router-address.query';
import { AddressesRepository } from '../../domain/AddressesRepository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { ContractAddress } from '../../../shared/types';
import { DeployedAddresses } from '../../../shared/DeployedAddresses';

@QueryHandler(GetRouterAddressQuery)
export class GetRouterAddressHandler implements IQueryHandler<GetRouterAddressQuery> {
  constructor(
    @Inject(Class.AddressesRepository)
    private readonly addressRepository: AddressesRepository,
  ) {}

  execute(): Promise<ContractAddress> {
    return Promise.resolve(DeployedAddresses.Router);
  }
}
