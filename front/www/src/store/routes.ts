import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import Route from '@/domain/paths/path'
import { ethers } from 'ethers'
import { useWeb3Store } from '@/store/web3'
import { useTransactionStore } from '@/store/transaction'
import { useMetadataStore } from '@/store/metadata'
import { IToken } from '@/domain/metadata/Metadata'

export const useRoutesStore = defineStore('routes', {
    state: () => ({
        routes: [] as Route[],
        originChainId: '',
        originTokenAddress: '',
        destinationChainId: '',
        destinationTokenAddress: '',
        selectedRoute: 0,
        slippageValue: '2',
        gasPriority: 'medium',
        receiverAddress: ''
    }),
    getters: {
        /**
         * Returns the selected origin chain ID
         */
        getOriginChainId(): string {
            return this.originChainId
        },
        /**
         * Returns the selected destination chain ID
         */
        getDestinationChainId(): string {
            return this.destinationChainId
        },
        /**
         * Returns the selected origin token address
         */
        getOriginTokenAddress(): string {
            return this.originTokenAddress
        },
        /**
         * Returns the selected destination token address
         */
        getDestinationTokenAddress(): string {
            return this.destinationTokenAddress
        },
        /**
         * Returns whether both tokens are selected
         */
        bothTokensSelected(): boolean {
            return (
                this.originChainId !== '' &&
                this.originTokenAddress !== '' &&
                this.destinationChainId !== '' &&
                this.destinationTokenAddress !== ''
            )
        },

        /**
         * Returns the selected origin token object
         */
        getOriginToken() {
            return (): IToken | undefined => {
                const metadataStore = useMetadataStore()
                return metadataStore.tokens
                    .find(token => {
                        return (
                            token.chainId === this.originChainId &&
                            token.address === this.originTokenAddress
                        )
                    })
            }
        },
        /**
         * Returns the selected destination token object
         */
        getDestinationToken() {
            return (): IToken | undefined => {
                const metadataStore = useMetadataStore()
                return metadataStore.tokens
                    .find(token => {
                        return (
                            token.chainId === this.destinationChainId &&
                            token.address === this.destinationTokenAddress
                        )
                    })
            }
        },
        /**
         * Returns whether the tokens belong to the same chain
         */
        sameChainAssets(): boolean {
            return this.originChainId === this.destinationChainId
        },
        /**
         * returns the currently selected route
         */
        getSelectedRoute(): Route {
            return this.routes[this.selectedRoute]
        },
        /**
         * returns the selected slippage
         */
        getSlippage(): string {
            return this.slippageValue
        },
        /**
         * returns the selected gas priority
         */
        getGasPriority(): string {
            return this.gasPriority
        },
        /**
         * returns the receiver address
         */
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
            const web3Store = useWeb3Store()
            this.routes = await SwidgeAPI.getQuote({
                fromChainId: this.originChainId,
                srcToken: this.originTokenAddress,
                toChainId: this.destinationChainId,
                dstToken: this.destinationTokenAddress,
                amount: amount,
                slippage: Number(this.getSlippage),
                senderAddress: web3Store.account || ethers.constants.AddressZero,
                receiverAddress: this.getReceiverAddress
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
         * Sets a specific token as selected on origin
         * @param chainId
         * @param address
         */
        selectOriginToken(chainId: string, address: string) {
            this.originChainId = chainId
            this.originTokenAddress = address
        },
        /**
         * Selects a specific token as selected on destination
         * @param chainId
         * @param address
         */
        selectDestinationToken(chainId: string, address: string) {
            this.destinationChainId = chainId
            this.destinationTokenAddress = address
        },
        /**
         * Switches origin and destination tokens one for the other
         */
        switchTokens() {
            const auxChainId = this.originChainId
            const auxAddress = this.originTokenAddress

            this.originChainId = this.destinationChainId
            this.originTokenAddress = this.destinationTokenAddress

            this.destinationChainId = auxChainId
            this.destinationTokenAddress = auxAddress
        },
        /**
         * Reset token selection
         */
        resetSelection() {
            this.originChainId = ''
            this.originTokenAddress = ''
            this.destinationChainId = ''
            this.destinationTokenAddress = ''
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
        /**
         * sets an address as a receiver
         * @param value
         */
        setReceiverAddress(value: string) {
            this.receiverAddress = value
        },
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useRoutesStore, import.meta.hot))
