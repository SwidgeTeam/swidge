import { INetwork } from '@/domain/chains/INetwork'

export const MAINNET_CHAIN_ID = '1'
export const POLYGON_CHAIN_ID = '137'
export const FANTOM_CHAIN_ID = '250'
export const BSC_CHAIN_ID = '56'
export const AVALANCHE_CHAIN_ID = '43114'
export const OPTIMISM_CHAIN_ID = '10'

export class Networks {
    private static networks = new Map<string, INetwork>([
        [
            MAINNET_CHAIN_ID,
            {
                id: MAINNET_CHAIN_ID,
                name: 'Mainnet',
                icon: 'https://api.rango.exchange/i/qr4L6S',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_MAINNET}`,
                live: true
            }
        ],
        [
            POLYGON_CHAIN_ID,
            {
                id: POLYGON_CHAIN_ID,
                name: 'Polygon',
                icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_POLYGON}`,
                live: true
            }
        ],
        [
            FANTOM_CHAIN_ID,
            {
                id: FANTOM_CHAIN_ID,
                name: 'Fantom',
                icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_FANTOM}`,
                live: true
            }
        ],
        [
            BSC_CHAIN_ID,
            {
                id: BSC_CHAIN_ID,
                name: 'BSC',
                icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_BSC}`,
                live: true
            }
        ],
        [
            AVALANCHE_CHAIN_ID,
            {
                id: AVALANCHE_CHAIN_ID,
                name: 'Avalanche',
                icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_AVALANCHE}`,
                live: true
            }
        ],
        [
            OPTIMISM_CHAIN_ID,
            {
                id: OPTIMISM_CHAIN_ID,
                name: 'Optimism',
                icon: 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/optimism.jpg',
                rpcUrl: `${import.meta.env.VITE_APP_RPC_NODE_OPTIMISM}`,
                live: true
            }
        ]
    ])

    public static get(chainId: string): INetwork {
        const chain = this.networks.get(chainId)
        if (!chain) {
            throw new Error('Unsupported chain')
        }
        return chain
    }

    public static all(): INetwork[] {
        return Array.from(this.networks.values())
    }

    public static live(): INetwork[] {
        return Networks.all().filter(network => {
            return network.live
        })
    }

    public static ids(): string[] {
        return Array.from(this.networks.keys())
    }
}
