import { Class } from '../Class';
import { PriceFeedConverter } from './PriceFeedConverter';

export default () => {
  return {
    provide: Class.PriceFeedConverter,
    useClass: PriceFeedConverter,
  };
};
