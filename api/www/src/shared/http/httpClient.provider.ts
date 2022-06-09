import { Class } from '../Class';
import { HttpClient } from './httpClient';

export default () => {
  return {
    provide: Class.HttpClient,
    useClass: HttpClient,
  };
};
