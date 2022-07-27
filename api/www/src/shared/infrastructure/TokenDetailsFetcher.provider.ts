import { TokenDetailsFetcher } from './TokenDetailsFetcher';
import { Class } from '../Class';

export default () => {
  return {
    provide: Class.TokenDetailsFetcher,
    useClass: TokenDetailsFetcher,
  };
};
