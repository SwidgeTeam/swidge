import Route from '@/domain/paths/path'

export class RoutesMother {
    public static create() {
        const route: Route = {
            aggregator: {
                id: '0',
                routeId: '',
                requiresCallDataQuoting: false,
                bothQuotesInOne: false,
                trackingId: '',
            },
            fees: {
                amount: '12231',
                amountInUsd: '0.45',
            },
            resume: {
                tokenIn: {
                    name: 'FROM',
                    address: '0xfrom',
                    symbol: 'FROM',
                    decimals: 18,
                },
                tokenOut: {
                    name: 'TO',
                    address: '0xto',
                    symbol: 'TO',
                    decimals: 18,
                },
                fromChain: '137',
                toChain: '250',
                amountIn: '111111111111111111',
                amountOut: '222222222222222222'
            },
            steps: [
                {
                    type: 'swap',
                    name: 'DexOne',
                    logo: 'imgUrl',
                    tokenIn: {
                        name: 'FROM',
                        address: '0xfrom',
                        symbol: 'FROM',
                        decimals: 18,
                    },
                    tokenOut: {
                        name: 'TOBRIDGE',
                        address: '0xtobridge',
                        symbol: 'TOBRIDGE',
                        decimals: 18,
                    },
                    amountIn: '111111111111111111',
                    amountOut: '151515151515151515',
                    fee: '0.3',
                    completed: false,
                },
                {
                    type: 'swap',
                    name: 'DexOne',
                    logo: 'imgUrl',
                    tokenIn: {
                        name: 'TOBRIDGE',
                        address: '0xtobridge',
                        symbol: 'TOBRIDGE',
                        decimals: 18,
                    },
                    tokenOut: {
                        name: 'TO',
                        address: '0xto',
                        symbol: 'TO',
                        decimals: 18,
                    },
                    amountIn: '151515151515151515',
                    amountOut: '222222222222222222',
                    fee: '0.15',
                    completed: false,
                }
            ],
            completed: false,
        }
        return [route]
    }
}
