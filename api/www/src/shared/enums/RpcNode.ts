import { Fantom, Polygon, BSC } from './ChainIds';
import 'dotenv/config';

export const RpcNode = {
  [Polygon]: process.env.RPC_NODE_POLYGON,
  [Fantom]: process.env.RPC_NODE_FANTOM,
  [BSC]: process.env.RPC_NODE_BSC,
};
