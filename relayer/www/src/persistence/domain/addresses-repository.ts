import { Contract } from '../../shared/domain/Contract';

export interface AddressesRepository {
  getRouterAddress(): Promise<string>;

  getMultichainRouters(): Promise<Contract[]>;
}
