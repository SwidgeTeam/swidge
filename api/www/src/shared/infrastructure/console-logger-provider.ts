import { ConsoleLogger } from './console-logger';
import { Class } from '../Class';

export default () => {
  return {
    provide: Class.Logger,
    useClass: ConsoleLogger,
  };
};
