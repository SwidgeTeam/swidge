import { Class } from '../../Class';
import { CachedHttpClient } from './cachedHttpClient';

export default () => {
  return {
    provide: Class.CachedHttpClient,
    useClass: CachedHttpClient,
  };
};
