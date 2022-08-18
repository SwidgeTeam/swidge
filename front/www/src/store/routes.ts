import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import Route, { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { ethers } from 'ethers'
import { useTokensStore } from '@/store/tokens'
import { useWeb3Store } from '@/store/web3'
import swidgeApi from '@/api/swidge-api'

export const useRoutesStore = defineStore('routes', {
    state: () => ({
        routes: [] as Route[],
        selectedRoute: 0,
        approvalTx: {} as ApprovalTransactionDetails,
        mainTx: {} as TransactionDetails,
    }),
    getters: {
        getSelectedRoute(): Route {
            return this.routes[this.selectedRoute]
        },
        getApprovalTx(): ApprovalTransactionDetails {
            return this.approvalTx
        },
        getMainTx(): TransactionDetails {
            return this.mainTx
        },
    },
    actions: {
        /**
         * Fetches the routes for a specific path
         * @param amount
         * @param slippage
         */
        async quotePath(amount: string, slippage: number) {
            const tokensStore = useTokensStore()
            const web3Store = useWeb3Store()
            this.routes = await SwidgeAPI.getQuote({
                fromChainId: tokensStore.getOriginChainId,
                srcToken: tokensStore.getOriginTokenAddress,
                toChainId: tokensStore.getDestinationChainId,
                dstToken: tokensStore.getDestinationTokenAddress,
                amount: amount,
                slippage: slippage,
                senderAddress: web3Store.account || ethers.constants.AddressZero,
                receiverAddress: web3Store.account || ethers.constants.AddressZero
            })
        },
        /**
         * Sets as completed the first step of the selected route
         */
        completeFirstStep() {
            this.routes[this.selectedRoute].steps[0].completed = true
        },
        /**
         * Sets as completed the whole selected route
         */
        completeRoute() {
            this.routes[this.selectedRoute].steps.forEach(step => {
                step.completed = true
            })
            this.routes[this.selectedRoute].completed = true
        },
        /**
         * Fetches the callData of both required transactions to execute the swidge
         * @param amount
         * @param slippage
         */
        async fetchBothTxs(amount: string, slippage: number) {
            const tokensStore = useTokensStore()
            const web3Store = useWeb3Store()
            const txs = await swidgeApi.getBothTxs({
                aggregatorId: this.getSelectedRoute.aggregator.id,
                fromChainId: tokensStore.getOriginChainId,
                srcToken: tokensStore.getOriginTokenAddress,
                toChainId: tokensStore.getDestinationChainId,
                dstToken: tokensStore.getDestinationTokenAddress,
                amount: amount,
                slippage: slippage,
                senderAddress: web3Store.account,
                receiverAddress: web3Store.account
            })
            this.approvalTx = txs.approvalTx
            this.mainTx = txs.mainTx
        },
        /**
         * Fetches the callData for the approval tx
         */
        async fetchApprovalTx() {
            const web3Store = useWeb3Store()
            this.approvalTx = await swidgeApi.getApprovalTx({
                aggregatorId: this.getSelectedRoute.aggregator.id,
                routeId: this.getSelectedRoute.aggregator.routeId,
                senderAddress: web3Store.account
            })
        },
        /**
         * Fetches the callData for the main tx
         */
        async fetchMainTx() {
            const web3Store = useWeb3Store()
            this.mainTx = await swidgeApi.getMainTx({
                aggregatorId: this.getSelectedRoute.aggregator.id,
                routeId: this.getSelectedRoute.aggregator.routeId,
                senderAddress: web3Store.account,
                receiverAddress: web3Store.account,
            })
        },
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useRoutesStore, import.meta.hot))
