import { Fantom, Polygon, BSC, Avalanche, Optimism, Mainnet } from './ChainIds';
import 'dotenv/config';

export const RpcNode = {
  [Mainnet]: process.env.RPC_NODE_MAINNET,
  [Polygon]: process.env.RPC_NODE_POLYGON,
  [Fantom]: process.env.RPC_NODE_FANTOM,
  [BSC]: process.env.RPC_NODE_BSC,
  [Avalanche]: process.env.RPC_NODE_AVALANCHE,
  [Optimism]: process.env.RPC_NODE_OPTIMISM,
};
