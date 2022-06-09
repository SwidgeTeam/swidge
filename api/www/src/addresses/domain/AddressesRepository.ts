import { ContractAddress } from '../../shared/types';
import { Addresses } from './Addresses';

export interface AddressesRepository {
  getRouter(): Promise<ContractAddress>;

  getAllBridgeAddresses(type: string): Promise<Addresses>;
}
