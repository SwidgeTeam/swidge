import fantomTokens from '../assets/fantom-tokens.json'
import polygonTokens from '../assets/polygon-tokens.json'
import bscTokens from '../assets/bsc-tokens.json'
import avalancheTokens from '../assets/avalanche-tokens.json'
import optimismTokens from '../assets/optimism-tokens.json'
import { INetwork } from '@/models/INetwork'
import FantomToken from '@/tokens/models/Fantom'
import PolygonToken from '@/tokens/models/Polygon'
import BSCToken from '@/tokens/models/BSC'
import AvalancheToken from '@/tokens/models/Avalanche'
import OptimismToken from '@/tokens/models/Optimism'

const networks = new Map<string, INetwork>()

export const POLYGON_CHAIN_ID = '137'
export const FANTOM_CHAIN_ID = '250'
export const BSC_CHAIN_ID = '56'
export const AVALANCHE_CHAIN_ID = '43114'
export const OPTIMISM_CHAIN_ID = '10'

const MAX_TOKENS = 60

networks.set(POLYGON_CHAIN_ID, {
    id: POLYGON_CHAIN_ID,
    name: 'Polygon',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg',
    tokens: polygonTokens.slice(0, MAX_TOKENS).map(token => new PolygonToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_POLYGON}`,
    live: true
})

networks.set(FANTOM_CHAIN_ID, {
    id: FANTOM_CHAIN_ID,
    name: 'Fantom',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg',
    tokens: fantomTokens.slice(0, MAX_TOKENS).map(token => new FantomToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_FANTOM}`,
    live: true
})

networks.set(BSC_CHAIN_ID, {
    id: BSC_CHAIN_ID,
    name: 'BSC',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
    tokens: bscTokens.slice(0, MAX_TOKENS).map(token => new BSCToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_BSC}`,
    live: true
})

networks.set(AVALANCHE_CHAIN_ID, {
    id: AVALANCHE_CHAIN_ID,
    name: 'Avalanche',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg',
    tokens: avalancheTokens.slice(0, MAX_TOKENS).map(token => new AvalancheToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_AVALANCHE}`,
    live: true
})

networks.set(OPTIMISM_CHAIN_ID, {
    id: OPTIMISM_CHAIN_ID,
    name: 'Optimism',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/optimism.jpg',
    tokens: optimismTokens.slice(0, MAX_TOKENS).map(token => new OptimismToken(token)),
    rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_OPTIMISM}`,
    live: false
})

export default networks
