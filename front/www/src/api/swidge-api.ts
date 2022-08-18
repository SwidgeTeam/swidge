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
import Route, { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import GetApprovalTxResponseJson from '@/api/models/get-approval-tx-response'
import GetTxResponse from '@/api/models/get-tx-response'

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
            return r.routes.map((r) => {
                const route: Route = {
                    aggregator: {
                        id: r.aggregator.id,
                        routeId: r.aggregator.routeId,
                        requireCallDataQuote: r.aggregator.requireCallDataQuote,
                    },
                    resume: {
                        fromChain: r.resume.fromChain,
                        toChain: r.resume.toChain,
                        tokenIn: r.resume.tokenIn,
                        tokenOut: r.resume.tokenOut,
                        amountIn: r.resume.amountIn,
                        amountOut: r.resume.amountOut,
                    },
                    steps: r.steps.map((step) => {
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
                if (!route.aggregator.requireCallDataQuote) {
                    if (r.tx) {
                        route.tx = {
                            to: r.tx.to,
                            callData: r.tx.callData,
                            value: r.tx.value,
                            gasLimit: r.tx.gasLimit,
                        }
                    }
                    if (r.approvalTx) {
                        route.approvalTx = {
                            to: r.approvalTx.to,
                            callData: r.approvalTx.callData,
                            gasLimit: r.approvalTx.gasLimit,
                        }
                    }
                }
                return route
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

    async getApprovalTx(query: {
        aggregatorId: string
        routeId: string
        senderAddress: string
    }): Promise<ApprovalTransactionDetails> {
        try {
            const response = await this.instance.get<GetApprovalTxResponseJson>('/build-approval-tx', { params: query })
            return {
                to: response.data.tx.to,
                callData: response.data.tx.callData,
                gasLimit: response.data.tx.gasLimit,
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const apiErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    async getMainTx(query: {
        aggregatorId: string
        routeId: string
        senderAddress: string
        receiverAddress: string
    }): Promise<TransactionDetails> {
        try {
            const response = await this.instance.get<GetTxResponse>('/build-main-tx', { params: query })
            return {
                to: response.data.tx.to,
                value: response.data.tx.value,
                callData: response.data.tx.callData,
                gasLimit: response.data.tx.gasLimit,
            }
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
