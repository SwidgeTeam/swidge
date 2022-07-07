import fantomTokens from '../assets/fantom-tokens.json'
import polygonTokens from '../assets/polygon-tokens.json'
import bscTokens from '../assets/bsc-tokens.json'
import { INetwork } from '@/models/INetwork'
import FantomToken from '@/tokens/models/Fantom'
import PolygonToken from '@/tokens/models/Polygon'
import BSCToken from '@/tokens/models/BSC';

const networks = new Map<string, INetwork>()

export const POLYGON_CHAIN_ID = '137'
export const FANTOM_CHAIN_ID = '250'
export const BSC_CHAIN_ID = '56'

networks.set(POLYGON_CHAIN_ID, {
    id: POLYGON_CHAIN_ID,
    name: 'Polygon',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg',
    tokens: polygonTokens.slice(0, 60).map(token => new PolygonToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_POLYGON}`
})

networks.set(FANTOM_CHAIN_ID, {
    id: FANTOM_CHAIN_ID,
    name: 'Fantom',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg',
    tokens: fantomTokens.slice(0, 60).map(token => new FantomToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_FANTOM}`
})

networks.set(BSC_CHAIN_ID, {
    id: BSC_CHAIN_ID,
    name: 'BSC',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
    tokens: bscTokens.slice(0, 60).map(token => new BSCToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_BSC}`
})

export default networks
