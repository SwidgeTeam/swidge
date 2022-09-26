import { acceptHMRUpdate, defineStore } from 'pinia'
import { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { useWeb3Store } from '@/store/web3'
import swidgeApi from '@/api/swidge-api'
import { useRoutesStore } from '@/store/routes'
import { TransactionStatus } from '@/api/models/get-status-check'
import { TxExecutedRequest } from '@/api/models/post-tx-executed'

export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        approvalTx: undefined as undefined | ApprovalTransactionDetails,
        mainTx: undefined as undefined | TransactionDetails,
        trackingId: '',
        statusCheckInterval: 0,
        txHash: '',
        currentNonce: 0,
    }),
    getters: {
        getApprovalTx(): ApprovalTransactionDetails | undefined {
            return this.approvalTx
        },
        getMainTx(): TransactionDetails | undefined {
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
                receiverAddress: routesStore.receiverAddress,
            })
        },
        /**
         * Fetches the callData of both required transactions to execute the swidge
         * @param amount
         */
        async fetchBothTxs(amount: string) {
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const srcToken = routesStore.getOriginToken()
            const dstToken = routesStore.getDestinationToken()
            if (!srcToken || !dstToken) {
                throw new Error('Some token is not selected')
            }
            const route = routesStore.getSelectedRoute
            const txs = await swidgeApi.getBothTxs({
                aggregatorId: route.aggregator.id,
                fromChainId: routesStore.getOriginChainId,
                toChainId: routesStore.getDestinationChainId,
                srcTokenAddress: srcToken.address,
                srcTokenSymbol: srcToken.symbol,
                srcTokenDecimals: srcToken.decimals.toString(),
                dstTokenAddress: dstToken.address,
                dstTokenSymbol: dstToken.symbol,
                dstTokenDecimals: dstToken.decimals.toString(),
                amount: amount,
                slippage: Number(routesStore.getSlippage),
                senderAddress: web3Store.account,
                receiverAddress: routesStore.receiverAddress
            })
            this.trackingId = txs.trackingId
            this.approvalTx = txs.approvalTx
            this.mainTx = txs.mainTx
        },
        /**
         * Informs the provider the tx has been executed
         */
        async informExecutedTx(txHash: string) {
            this.txHash = txHash
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            const route = routesStore.getSelectedRoute
            if (!this.mainTx) {
                throw new Error('something very wrong, what did we execute then?')
            }
            const request = {
                aggregatorId: route.aggregator.id,
                fromChainId: routesStore.getOriginChainId,
                toChainId: routesStore.getDestinationChainId,
                fromAddress: web3Store.account,
                toAddress: routesStore.receiverAddress,
                fromToken: routesStore.getOriginTokenAddress,
                amountIn: this.mainTx.value,
                txHash: this.txHash,
                trackingId: this.trackingId,
            }
            swidgeApi.informExecutedTx(request)
        },
        /**
         * Sets an interval to check the status of the TX until it succeeds or fails
         */
        startCheckingStatus: function () {
            this.statusCheckInterval = window.setInterval(() => {
                swidgeApi.checkTxStatus({
                    txHash: this.txHash,
                }).then(response => {
                    const routesStore = useRoutesStore()
                    if (response.status === TransactionStatus.Success) {
                        routesStore.completeRoute()
                        clearInterval(this.statusCheckInterval)
                    } else if (response.status === TransactionStatus.Failed) {
                        // TODO do something
                        clearInterval(this.statusCheckInterval)
                    }
                })
            }, 5000)
        },
        /**
         * fetches and stores the current nonce of the wallet to have the correct count
         */
        setCurrentNonce: async function () {
            const web3Store = useWeb3Store()
            this.currentNonce = await web3Store.getCurrentNonce()
        },
        /**
         * increment the current nonce
         */
        incrementNonce: function () {
            this.currentNonce = this.currentNonce + 1
        },
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
