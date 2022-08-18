import { acceptHMRUpdate, defineStore } from 'pinia'
import { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { useTokensStore } from '@/store/tokens'
import { useWeb3Store } from '@/store/web3'
import swidgeApi from '@/api/swidge-api'
import { useRoutesStore } from '@/store/routes';

export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        approvalTx: {} as ApprovalTransactionDetails,
        mainTx: {} as TransactionDetails,
        trackingId: '',
    }),
    getters: {
        getApprovalTx(): ApprovalTransactionDetails {
            return this.approvalTx
        },
        getMainTx(): TransactionDetails {
            return this.mainTx
        },
    },
    actions: {
        /**
         * Fetches the callData for the approval tx
         */
        async fetchApprovalTx() {
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const route = routesStore.getSelectedRoute
            this.approvalTx = await swidgeApi.getApprovalTx({
                aggregatorId: route.aggregator.id,
                routeId: route.aggregator.routeId,
                senderAddress: web3Store.account
            })
        },
        /**
         * Fetches the callData for the main tx
         */
        async fetchMainTx() {
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const route = routesStore.getSelectedRoute
            this.mainTx = await swidgeApi.getMainTx({
                aggregatorId: route.aggregator.id,
                routeId: route.aggregator.routeId,
                senderAddress: web3Store.account,
                receiverAddress: web3Store.account,
            })
        },
        /**
         * Fetches the callData of both required transactions to execute the swidge
         * @param amount
         * @param slippage
         */
        async fetchBothTxs(amount: string, slippage: number) {
            const tokensStore = useTokensStore()
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const route = routesStore.getSelectedRoute
            const txs = await swidgeApi.getBothTxs({
                aggregatorId: route.aggregator.id,
                fromChainId: tokensStore.getOriginChainId,
                srcToken: tokensStore.getOriginTokenAddress,
                toChainId: tokensStore.getDestinationChainId,
                dstToken: tokensStore.getDestinationTokenAddress,
                amount: amount,
                slippage: slippage,
                senderAddress: web3Store.account,
                receiverAddress: web3Store.account
            })
            this.trackingId = txs.trackingId
            this.approvalTx = txs.approvalTx
            this.mainTx = txs.mainTx
        },
        /**
         * Informs the provider the tx has been executed
         */
        informExecutedTx(txHash: string) {
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const route = routesStore.getSelectedRoute
            swidgeApi.informExecutedTx({
                aggregatorId: route.aggregator.id,
                fromAddress: web3Store.account,
                toAddress: web3Store.account,
                txHash: txHash,
                trackingId: this.trackingId,
            })
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
