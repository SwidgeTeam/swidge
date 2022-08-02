import axios from 'axios'
import HttpClient from './http-base-client'
import { indexedErrors } from './models/get-quote-error'
import GetQuoteRequest from './models/get-quote-request'
import GetQuoteResponse from './models/get-quote-response'
import { ApiErrorResponse } from '@/api/models/ApiErrorResponse'
import { TransactionsList } from '@/api/models/transactions'
import { TokenList } from '@/domain/tokens/TokenList'
import IToken from '@/domain/tokens/IToken'
import { Networks } from '@/domain/chains/Networks'
import Path from '@/domain/paths/path'

class SwidgeAPI extends HttpClient {
    public constructor() {
        super(import.meta.env.VITE_APP_API_HOST)
    }

    public async fetchTokens(): Promise<IToken[]> {
        try {
            const response = await this.instance.get<TokenList>('/token-list')
            return response.data.list.map(token => {
                const networkName = Networks.get(token.c).name
                return {
                    chainId: token.c,
                    chainName: networkName,
                    address: token.a,
                    name: token.n,
                    symbol: token.s,
                    decimals: token.d,
                    logo: token.l,
                }
            })
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const apiErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    public async getQuote(getQuotePayload: GetQuoteRequest): Promise<Path> {
        try {
            const response = await this.instance.get<GetQuoteResponse>('/path', { params: getQuotePayload })
            const r = response.data
            return {
                router: r.router,
                amountOut: r.amountOut,
                destinationFee: r.destinationFee,
                originSwap: {
                    code: r.originSwap.code,
                    tokenIn: r.originSwap.tokenIn,
                    tokenOut: r.originSwap.tokenOut,
                    data: r.originSwap.data,
                    amountOut: r.originSwap.amountOut,
                    required: r.originSwap.required,
                    estimatedGas: r.originSwap.estimatedGas,
                    fee: r.originSwap.fee,
                },
                bridge: {
                    tokenIn: r.bridge.tokenIn,
                    tokenOut: r.bridge.tokenOut,
                    toChainId: r.bridge.toChainId,
                    data: r.bridge.data,
                    required: r.bridge.required,
                    amountOut: r.bridge.amountOut,
                    fee: r.bridge.fee,
                },
                destinationSwap: {
                    tokenIn: r.destinationSwap.tokenIn,
                    tokenOut: r.destinationSwap.tokenOut,
                    required: r.destinationSwap.required,
                    fee: r.destinationSwap.fee,
                }
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const getQuoteErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = indexedErrors[getQuoteErrorResponse.message] ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    public async getTransactions(walletAddress: string): Promise<TransactionsList> {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return Promise.resolve({
            'transactions': [
                {
                    'txHash': '0x1',
                    'status': 'processing',
                    'date': '1658998584538',
                    'fromChain': '137',
                    'toChain': '250',
                    'srcAsset': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    'dstAsset': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'amountIn': '10000000000000000000'
                }, {
                    'txHash': '0x2',
                    'status': 'completed',
                    'date': '1658998584538',
                    'fromChain': '250',
                    'toChain': '137',
                    'srcAsset': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'dstAsset': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    'amountIn': '10000000000000000000'
                }, {
                    'txHash': '0x3',
                    'status': 'processing',
                    'date': '1658998584538',
                    'fromChain': '137',
                    'toChain': '250',
                    'srcAsset': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    'dstAsset': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'amountIn': '10000000000000000000'
                }, {
                    'txHash': '0x4',
                    'status': 'completed',
                    'date': '1658998584538',
                    'fromChain': '250',
                    'toChain': '137',
                    'srcAsset': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'dstAsset': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    'amountIn': '10000000000000000000'
                }, {
                    'txHash': '0x5',
                    'status': 'completed',
                    'date': '1658998584538',
                    'fromChain': '250',
                    'toChain': '137',
                    'srcAsset': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    'dstAsset': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                    'amountIn': '10000000000000000000'
                },
            ]
        })
        //try {
        //    const response = await this.instance.get('https://mocki.io/v1/891eedcb-dd7c-4901-b899-1f6f081e2794')
        //    return response.data
        //} catch (e: unknown) {
        //    if (axios.isAxiosError(e)) {
        //        const apiErrorResponse = e.response?.data as ApiErrorResponse
        //        const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
        //        throw new Error(errorMessage)
        //    }
        //    throw new Error('UnknownError no axios error')
        //}
    }
}

// TODO: Let's see if worth it to expose just one instance of the API
export default new SwidgeAPI()
