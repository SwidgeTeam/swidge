import fantomTokens from '../assets/fantom-tokens.json';
import polygonTokens from '../assets/polygon-tokens.json';
import { INetwork } from "@/models/INetwork";
import FantomToken from "@/tokens/models/Fantom";
import PolygonToken from "@/tokens/models/Polygon";

const networks = new Map<string, INetwork>()

export const POLYGON_CHAIN_ID = '137'
export const FANTOM_CHAIN_ID = '250'

networks.set(POLYGON_CHAIN_ID, {
    id: POLYGON_CHAIN_ID,
    name: 'Polygon',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg',
    tokens: polygonTokens.slice(0, 20).map(polygonRawToken => new PolygonToken(polygonRawToken)),
    rpcUrl: 'https://polygon-rpc.com'
})
networks.set(FANTOM_CHAIN_ID, {
    id: FANTOM_CHAIN_ID,
    name: 'Fantom',
    icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg',
    tokens: fantomTokens.slice(0, 20).map(fantomRawToken => new FantomToken(fantomRawToken)),
    rpcUrl: 'https://rpc.ftm.tools/'
})

export default networks;
