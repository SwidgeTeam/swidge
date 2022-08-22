import { Class } from '../Class';
import { ConsoleLogger } from './console-logger';

export default () => {
  return {
    provide: Class.Logger,
    useClass: ConsoleLogger,
  };
};
