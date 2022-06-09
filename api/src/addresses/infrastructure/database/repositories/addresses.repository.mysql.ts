import { AddressesRepository } from '../../../domain/AddressesRepository';
import { ContractAddress } from '../../../../shared/types';
import { EntityManager, EntityRepository } from 'typeorm';
import { AddressesEntity } from '../models/addresses.entity';
import { Addresses } from '../../../domain/Addresses';
import { Contract } from '../../../domain/Contract';

@EntityRepository(AddressesEntity)
export class AddressesRepositoryMysql implements AddressesRepository {
  constructor(private readonly manager: EntityManager) {}

  public async getRouter(): Promise<ContractAddress> {
    const result = await this.manager.findOne(AddressesEntity, {
      typeContract: 'router',
      chainId: 'any',
    });
    return result ? result.address : '';
  }

  public async getAllBridgeAddresses(type: string): Promise<Addresses> {
    const result = await this.manager.find(AddressesEntity, {
      typeContract: type,
    });
    return new Addresses(
      result.map((item) => {
        return new Contract(item.chainId, item.address);
      }),
    );
  }
}
