import { TokenDetailsFetcher } from './TokenDetailsFetcher';

export default () => {
  return {
    provide: 'TokenDetailsFetcher',
    useClass: TokenDetailsFetcher,
  };
};
