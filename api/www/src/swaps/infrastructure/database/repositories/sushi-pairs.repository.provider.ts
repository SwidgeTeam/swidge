import { Class } from '../../../../shared/Class';
import { SushiPairsRepositoryMysql } from './sushi-pairs.repository.mysql';

export default () => {
  return {
    provide: Class.SushiPairsRepository,
    useClass: SushiPairsRepositoryMysql,
  };
};
