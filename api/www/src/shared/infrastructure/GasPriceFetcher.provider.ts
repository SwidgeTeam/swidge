import { Class } from '../Class';
import { GasPriceFetcher } from './GasPriceFetcher';

export default () => {
  return {
    provide: Class.GasPriceFetcher,
    useClass: GasPriceFetcher,
  };
};
