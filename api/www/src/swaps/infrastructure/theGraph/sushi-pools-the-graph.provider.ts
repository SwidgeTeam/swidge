import { SushiPoolsTheGraph } from './sushi-pools-the-graph';
import { Class } from '../../../shared/Class';

export default () => {
  return {
    provide: Class.SushiPairsTheGraph,
    useClass: SushiPoolsTheGraph,
  };
};
