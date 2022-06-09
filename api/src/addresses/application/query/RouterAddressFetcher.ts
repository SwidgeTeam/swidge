import { ContractAddress } from '../../../shared/types';
import { Inject } from '@nestjs/common';
import { AddressesRepository } from '../../domain/AddressesRepository';
import { Class } from '../../../shared/Class';

export class RouterAddressFetcher {
  constructor(
    @Inject(Class.AddressesRepository)
    private readonly repository: AddressesRepository,
  ) {}

  async getAddress(): Promise<ContractAddress> {
    return this.repository.getRouter();
  }
}
