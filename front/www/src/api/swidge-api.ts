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
import Route from '@/domain/paths/path'

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

    public async getQuote(getQuotePayload: GetQuoteRequest): Promise<Route[]> {
        try {
            const response = await this.instance.get<GetQuoteResponse>('/path', { params: getQuotePayload })
            const r = response.data
            return r.routes.map((route) => {
                return {
                    amountOut: route.amountOut.toString(),
                    tx: {
                        to: route.tx.to,
                        callData: route.tx.callData,
                        value: route.tx.value,
                        gasLimit: route.tx.gasLimit,
                        gasPrice: route.tx.gasPrice,
                    },
                    resume: {
                        fromChain: route.resume.fromChain,
                        toChain: route.resume.toChain,
                        tokenIn: route.resume.tokenIn,
                        tokenOut: route.resume.tokenOut,
                        amountIn: route.resume.amountIn,
                        amountOut: route.resume.amountOut,
                    },
                    steps: route.steps.map((step) => {
                        return {
                            type: step.type,
                            name: step.name,
                            logo: step.logo,
                            tokenIn: step.tokenIn,
                            tokenOut: step.tokenOut,
                            amountIn: step.amountIn,
                            amountOut: step.amountOut,
                            fee: step.fee,
                            completed: false,
                        }
                    }),
                    completed: false,
                }
            })
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
        try {
            const response = await this.instance.get(`/transactions/${walletAddress}`)
            return response.data
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const apiErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }
}

export default new SwidgeAPI()
