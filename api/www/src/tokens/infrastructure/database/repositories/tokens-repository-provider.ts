import { Class } from '../../../../shared/Class';
import { TokensRepositoryMySQL } from './tokens-repository-mysql';

export default () => {
  return {
    provide: Class.TokensRepository,
    useClass: TokensRepositoryMySQL,
  };
};
