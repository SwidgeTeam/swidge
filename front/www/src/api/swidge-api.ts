import axios from 'axios'
import HttpClient from './http-base-client'
import { GetQuoteRequest, GetQuoteResponse } from './models/get-quote'
import { ApiErrorResponse } from '@/api/models/ApiErrorResponse'
import { TransactionsListJson } from '@/api/models/get-transactions'
import Route, { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import GetApprovalTxResponseJson from '@/api/models/get-approval-tx-response'
import GetMainTxResponse from '@/api/models/get-main-tx-response'
import GetBothTxsResponse from '@/api/models/get-both-txs-response'
import GetBothTxsRequest from '@/api/models/get-both-txs-request'
import { StatusCheckRequest, StatusCheckResponse } from '@/api/models/get-status-check'
import { MetadataJson } from '@/api/models/get-metadata'
import { Metadata, TokenBalance } from '@/domain/metadata/Metadata'
import { WalletBalancesJson } from '@/api/models/get-balances'
import { BigNumber } from 'ethers'
import { TxExecutedRequest } from '@/api/models/post-tx-executed'
import { Transaction } from '@/domain/transactions/transactions'

class SwidgeAPI extends HttpClient {
    public constructor() {
        super(import.meta.env.VITE_APP_API_HOST)
    }

    public async fetchMetadata(): Promise<Metadata> {
        try {
            const response = await this.instance.get<MetadataJson>('/meta')
            const chainNames: Record<string, string> = {} // temp store to use on tokens
            const chains = response.data.chains.map(chain => {
                chainNames[chain.i] = chain.n
                return {
                    type: chain.t,
                    id: chain.i,
                    name: chain.n,
                    logo: chain.l,
                    metamask: {
                        chainName: chain.m.c,
                        blockExplorerUrls: chain.m.b,
                        rpcUrls: chain.m.r,
                        nativeCurrency: {
                            name: chain.m.n.n,
                            symbol: chain.m.n.s,
                            decimals: chain.m.n.d,
                        }
                    }
                }
            })
            const tokens = {}
            for (const [chainId, tokenList] of Object.entries(response.data.tokens)) {
                // @ts-ignore
                tokens[chainId] = tokenList.map(token => {
                    return {
                        chainId: token.c,
                        chainName: chainNames[token.c],
                        address: token.a,
                        name: token.n,
                        symbol: token.s,
                        decimals: token.d,
                        logo: token.l,
                        price: token.p,
                        balance: BigNumber.from(0)
                    }
                })
            }
            return {
                tokens: tokens,
                chains: chains
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

    public async fetchBalances(wallet: string): Promise<{
        empty: boolean;
        tokens: TokenBalance[]
    }> {
        try {
            const response = await this.instance.get<WalletBalancesJson>('/token-balances', {
                params: {
                    wallet: wallet
                }
            })
            return {
                empty: response.data.empty,
                tokens: response.data.tokens.map(token => {
                    return {
                        chainId: token.chainId,
                        address: token.address,
                        balance: BigNumber.from(token.amount)
                    }
                })
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

    public async getQuote(getQuotePayload: GetQuoteRequest): Promise<Route[]> {
        try {
            const response = await this.instance.get<GetQuoteResponse>('/path', { params: getQuotePayload })
            const r = response.data
            return r.routes.map(r => {
                const route: Route = {
                    id: r.id,
                    tags: r.tags,
                    aggregator: {
                        id: r.aggregator.id,
                        routeId: r.aggregator.routeId,
                        requiresCallDataQuoting: r.aggregator.requiresCallDataQuoting,
                        bothQuotesInOne: r.aggregator.bothQuotesInOne,
                        trackingId: r.aggregator.trackingId,
                    },
                    resume: {
                        fromChain: r.resume.fromChain,
                        toChain: r.resume.toChain,
                        tokenIn: r.resume.tokenIn,
                        tokenOut: r.resume.tokenOut,
                        amountIn: r.resume.amountIn,
                        amountOut: r.resume.amountOut,
                        executionTime: r.resume.executionTime,
                    },
                    fees: {
                        amount: r.fees.amount,
                        amountInUsd: r.fees.amountInUsd,
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
                            executionTime: step.executionTime,
                            completed: false,
                        }
                    }),
                    completed: false,
                }
                if (r.mainTx) {
                    route.tx = {
                        to: r.mainTx.to,
                        callData: r.mainTx.callData,
                        value: r.mainTx.value,
                        gasLimit: r.mainTx.gasLimit,
                    }
                }
                if (r.approvalTx) {
                    route.approvalTx = {
                        to: r.approvalTx.to,
                        callData: r.approvalTx.callData,
                        gasLimit: r.approvalTx.gasLimit,
                    }
                }
                return route
            })
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const getQuoteErrorResponse = e.response?.data as ApiErrorResponse
                throw new Error(getQuoteErrorResponse.message)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    public async getTransactions(walletAddress: string): Promise<Transaction[]> {
        try {
            const response = await this.instance.get<TransactionsListJson>(`/transactions/${walletAddress}`)
            return response.data.transactions.map(tx => {
                return {
                    id: tx.id,
                    originTxHash: tx.originTxHash,
                    destinationTxHash: tx.destinationTxHash,
                    status: tx.status,
                    date: tx.date,
                    fromChain: tx.fromChain,
                    toChain: tx.toChain,
                    srcAsset: tx.srcAsset,
                    dstAsset: tx.dstAsset,
                    amountIn: tx.amountIn,
                    amountOut: tx.amountOut,
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
            const response = await this.instance.get<GetMainTxResponse>('/build-main-tx', { params: query })
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

    async getBothTxs(query: GetBothTxsRequest): Promise<{
        trackingId: string,
        approvalTx: ApprovalTransactionDetails | undefined,
        mainTx: TransactionDetails,
    }> {
        try {
            const response = await this.instance.get<GetBothTxsResponse>('/build-both-txs', { params: query })
            return {
                trackingId: response.data.trackingId,
                approvalTx: response.data.approvalTx
                    ? {
                        to: response.data.approvalTx.to,
                        callData: response.data.approvalTx.callData,
                        gasLimit: response.data.approvalTx.gasLimit,
                    }
                    : undefined,
                mainTx: {
                    to: response.data.mainTx.to,
                    value: response.data.mainTx.value,
                    callData: response.data.mainTx.callData,
                    gasLimit: response.data.mainTx.gasLimit,
                }
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

    async informExecutedTx(params: TxExecutedRequest): Promise<void> {
        try {
            await this.instance.post('/tx-executed', params)
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const apiErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    checkTxStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
        try {
            return this.instance.get('/tx-status', { params: request })
                .then(response => response.data)
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const apiErrorResponse = e.response?.data as ApiErrorResponse
                const errorMessage = apiErrorResponse.message ?? 'Unhandled error!'
                throw new Error(errorMessage)
            }
            throw new Error('UnknownError no axios error')
        }
    }

    async addImportedToken(params: {
        chainId: string,
        address: string,
        wallet: string
    }) {
        try {
            await this.instance.post('/imported-token', params)
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
