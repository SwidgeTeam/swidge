import { Class } from '../../../../shared/Class';
import { AddressesRepositoryMysql } from './addresses.repository.mysql';

export default () => {
  return {
    provide: Class.AddressesRepository,
    useClass: AddressesRepositoryMysql,
  };
};
