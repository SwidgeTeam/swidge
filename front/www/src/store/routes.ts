import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import Route from '@/domain/paths/path'
import { ethers } from 'ethers'
import { useTokensStore } from '@/store/tokens'
import { useWeb3Store } from '@/store/web3'
import { useTransactionStore } from '@/store/transaction'

export const useRoutesStore = defineStore('routes', {
    state: () => ({
        routes: [] as Route[],
        selectedRoute: 0,
        slippageValue: '2',
        gasPriority: 'medium',
        receiverAddress: ''
    }),
    getters: {
        getSelectedRoute(): Route {
            return this.routes[this.selectedRoute]
        },
        getSlippage(): string {
            return this.slippageValue
        },
        getGasPriority(): string {
            return this.gasPriority
        },
        getReceiverAddress(): string {
            return this.receiverAddress
        },
    },
    actions: {
        /**
         * Fetches the routes for a specific path
         * @param amount
         */
        async quotePath(amount: string) {
            const tokensStore = useTokensStore()
            const web3Store = useWeb3Store()
            const routesStore = useRoutesStore()
            this.routes = await SwidgeAPI.getQuote({
                fromChainId: tokensStore.getOriginChainId,
                srcToken: tokensStore.getOriginTokenAddress,
                toChainId: tokensStore.getDestinationChainId,
                dstToken: tokensStore.getDestinationTokenAddress,
                amount: amount,
                slippage: Number(routesStore.getSlippage),
                senderAddress: web3Store.account || ethers.constants.AddressZero,
                receiverAddress: routesStore.getReceiverAddress
            })
            this.selectRoute(0) // selects the top route       
        },
        /**
         * Marks the route `index` as selected
         * @param index
         */
        selectRoute(index: number) {
            const transactionStore = useTransactionStore()
            this.selectedRoute = index
            const route = this.getSelectedRoute
            transactionStore.trackingId = route.aggregator.trackingId
            transactionStore.approvalTx = route.approvalTx
            transactionStore.mainTx = route.tx
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
         * sets slippage
         * @param value
         */
        setSlippage(value: string) {
            this.slippageValue = value
        },
        /**
         * sets gas priority
         * @param value
         */
        setGasPriority(value: string) {
            this.gasPriority = value
        },
        setReceiverAddress(value: string) {
            this.receiverAddress = value
        },
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useRoutesStore, import.meta.hot))
