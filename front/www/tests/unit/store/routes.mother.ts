import Route from '@/domain/paths/path'

export default class RouteMother {
    public static slowRoute(): Route {
        const route = this.default()
        route.resume.executionTime = 330
        return route
    }

    public static fastRoute(): Route {
        const route = this.default()
        route.resume.executionTime = 30
        return route
    }

    public static default(): Route {
        return {
            'id': '',
            'tags': [],
            'aggregator': {
                'id': '0',
                'routeId': '',
                'requiresCallDataQuoting': false,
                'bothQuotesInOne': false,
                'trackingId': ''
            },
            'resume': {
                'fromChain': '250',
                'toChain': '137',
                'tokenIn': {
                    'chainId': '250',
                    'name': 'Wrapped Fantom',
                    'address': '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
                    'decimals': 18,
                    'symbol': 'WFTM',
                    'icon': 'https://api.rango.exchange/i/dDI50C',
                },
                'tokenOut': {
                    'chainId': '137',
                    'name': 'Matic Token',
                    'address': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'decimals': 18,
                    'symbol': 'MATIC',
                    'icon': 'https://api.rango.exchange/i/dDI50C',
                },
                'amountIn': '221.0',
                'amountOut': '77.144799376959137804',
                'executionTime': 640
            },
            'fees': { 'amount': '0', 'amountInUsd': '0.50415632' },
            'providers': [
                {
                    'name': 'ZeroEx',
                    'logo': 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.0909090909090908,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b',
                },
                {
                    'name': 'Multichain',
                    'logo': 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.0909090909090908,format=auto/https%3A%2F%2F3757759239-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FUdcg2zIVro9DItOfrezt%252Ficon%252F5OTzC3fjscHIvkBqqmEC%252Fc-256-color%25403x.png%3Falt%3Dmedia%26token%3D55e6a89d-3754-49e9-b93d-27136ad43635',
                },
                {
                    'name': 'Sushiswap',
                    'logo': 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://app.sushi.com/images/logo.svg',
                }
            ],
            'approvalTx': {
                'to': '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
                'callData': '0x095ea7b30000000000000000000000001a6e1ef1d28a7d9fed016c88f4d185836756478100000000000000000000000000000000000000000000000bfafdb91781540000',
                'gasLimit': '70000'
            },
            'tx': {
                'to': '0x1a6e1ef1d28A7d9feD016c88f4d1858367564781',
                'callData': '0x8b3febfe00000000000000000000000000000000000000000000000bfafdb9178154000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000c99f374e96fb1c2eeafe92596bed04aa1397971c000000000000000000000000000000000000000000000003f0926b3228504000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000021be370d5312f44cb42ce377bc9b8a0cef1a4c8300000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b7500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010438ed173900000000000000000000000000000000000000000000000bfafdb91781540000000000000000000000000000000000000000000000000000000000000396c66f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000001a6e1ef1d28a7d9fed016c88f4d185836756478100000000000000000000000000000000000000000000000000000000630cac32000000000000000000000000000000000000000000000000000000000000000200000000000000000000000021be370d5312f44cb42ce377bc9b8a0cef1a4c8300000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b7500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b75000000000000000000000000000000000000000000000000000000000000008900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000095bf7e307bc1ab0ba38ae10fc27084bc36fcd605',
                'value': '2060915973763407',
                'gasLimit': '2000000'
            },
            'completed': false
        }
    }

    public static list(): Route[] {
        const first = this.default()
        const second = this.default()
        const third = this.default()
        const fourth = this.default()
        first.id = '0'
        second.id = '1'
        third.id = '2'
        fourth.id = '3'

        return [first, second, third]
    }
}
