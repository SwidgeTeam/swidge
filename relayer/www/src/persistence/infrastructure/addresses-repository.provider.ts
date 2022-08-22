import { Class } from '../../shared/Class';
import { AddressesRepositoryImpl } from './addresses-repository';

export default () => {
  return {
    provide: Class.AddressesRepository,
    useClass: AddressesRepositoryImpl,
  };
};
