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
        showContainer: false,
        loadingRoutes: false,
        routes: [] as Route[],
        amountIn: '',
        originChainId: '',
        originTokenAddress: '',
        destinationChainId: '',
        destinationTokenAddress: '',
        selectedRoute: '',
        slippageValue: '2',
        gasPriority: 'medium',
        receiverAddress: '',
    }),
    getters: {
        /**
         * returns the currently selected route
         */
        getSelectedRoute(): Route {
            const route = this.routes.find(route => route.id === this.selectedRoute)
            if (!route) {
                throw new Error('Route does not exist')
            }
            return route
        },
        /**
         * returns the id of selected route
         */
        getSelectedId(): string {
            return this.selectedRoute
        },
        /**
         * returns all routes
         */
        getAllRoutes(): Route[] {
            return this.routes
        },
        /**
         * returns the promoted routes
         */
        getPromotedRoutes(): Route[] {
            return this.routes
        },
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
        getOriginToken(state) {
            return (): IToken | undefined => {
                const metadataStore = useMetadataStore()
                const list = metadataStore.tokens[state.originChainId]
                return list
                    ? list.find(token => {
                        return (
                            token.address === state.originTokenAddress
                        )
                    })
                    : undefined
            }
        },
        /**
         * Returns the selected destination token object
         */
        getDestinationToken(state) {
            return (): IToken | undefined => {
                const metadataStore = useMetadataStore()
                const list = metadataStore.tokens[state.destinationChainId]
                return list
                    ? list.find(token => {
                        return (
                            token.address === state.destinationTokenAddress
                        )
                    })
                    : undefined
            }
        },
        /**
         * Returns whether the tokens belong to the same chain
         */
        isCrossChainRoute(): boolean {
            return this.originChainId !== this.destinationChainId
        },
        /**
         * returns selected input amount for the route
         */
        getAmountIn(): string {
            return this.amountIn
        },
        /**
         * returns selected input amount for the route
         */
        getRawAmountIn(): string {
            return ethers.utils.parseUnits(this.amountIn, this.getOriginToken()?.decimals).toString()
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
         * checks if the receiver is a valid address
         */
        isValidReceiverAddress(): boolean {
            try {
                ethers.utils.getAddress(this.receiverAddress)
                return true
            } catch (e) {
                // not an address, just a term
                return false
            }
        },
        async getSelectedTokenBalance(): Promise<string> {
            const token = this.getOriginToken()
            if (!token) {
                return '0'
            }
            let balance = token.balance
            if (useMetadataStore().emptyPrices) {
                balance = await useWeb3Store().getBalance(token)
            }
            return ethers.utils.formatUnits(balance, token.decimals)
        }
    },
    actions: {
        /**
         * Fetches the routes for a specific path
         */
        async quotePath() {
            this.showContainer = true
            const web3Store = useWeb3Store()
            const srcToken = this.getOriginToken()
            const dstToken = this.getDestinationToken()
            if (!srcToken || !dstToken) {
                throw new Error('Some token is not selected')
            }
            try {
                this.loadingRoutes = true
                this.routes = await SwidgeAPI.getQuote({
                    fromChainId: this.originChainId,
                    srcTokenAddress: srcToken.address,
                    srcTokenSymbol: srcToken.symbol,
                    srcTokenDecimals: srcToken.decimals.toString(),
                    toChainId: this.destinationChainId,
                    dstTokenAddress: dstToken.address,
                    dstTokenSymbol: dstToken.symbol,
                    dstTokenDecimals: dstToken.decimals.toString(),
                    amount: this.amountIn,
                    slippage: Number(this.getSlippage),
                    senderAddress: web3Store.account || ethers.constants.AddressZero,
                    receiverAddress: this.receiverAddress || ethers.constants.AddressZero,
                })
                const idToSelect = this.routes.find(route => route.tags.includes('cheapest'))?.id as string
                this.selectRoute(idToSelect)
            } catch (e) {
                this.routes = []
            } finally {
                this.loadingRoutes = false
            }
        },
        /**
         * Marks the route `index` as selected
         * @param id
         */
        selectRoute(id: string) {
            const transactionStore = useTransactionStore()
            this.selectedRoute = id
            const route = this.getSelectedRoute
            transactionStore.mainTx = route.tx
            transactionStore.trackingId = route.aggregator.trackingId
            transactionStore.approvalContract = route.approvalContract
        },
        /**
         * Sets a specific token as selected on origin
         * @param chainId
         * @param address
         */
        selectOriginToken(chainId: string, address: string) {
            this.originChainId = chainId
            this.originTokenAddress = address
            this.routes = []
            this.selectedRoute = ''
            this.showContainer = false
        },
        /**
         * Selects a specific token as selected on destination
         * @param chainId
         * @param address
         */
        selectDestinationToken(chainId: string, address: string) {
            this.destinationChainId = chainId
            this.destinationTokenAddress = address
            this.routes = []
            this.selectedRoute = ''
            this.showContainer = false
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

            this.routes = []
            this.selectedRoute = ''
            this.showContainer = false
        },
        /**
         * sets input amount
         */
        setAmountIn(amount: string) {
            this.amountIn = amount
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
