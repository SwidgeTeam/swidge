import { acceptHMRUpdate, defineStore } from 'pinia'
import swidgeApi from '@/api/swidge-api'
import IToken from '@/domain/tokens/IToken'

export const useTokensStore = defineStore('tokens', {
    state: () => ({
        tokens: [] as IToken[],
        originChainId: '',
        originTokenAddress: '',
        destinationChainId: '',
        destinationTokenAddress: '',
    }),
    getters: {
        /**
         * Returns whole list of tokens
         */
        getTokens(): IToken[] {
            return this.tokens
        },
        /**
         * Returns list of tokens of a specific chain
         * @param state
         */
        getChainTokens(state) {
            return (chainId: string): IToken[] => {
                return state.tokens
                    .filter(token => {
                        return token.chainId === chainId
                    })
            }
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
         * Returns the selected origin chain name
         */
        getOriginChainName(): string {
            const token = this.getOriginToken()
            return token ? token.chainName : ''
        },
        /**
         * Returns the selected destination chain name
         */
        getDestinationChainName(): string {
            const token = this.getDestinationToken()
            return token ? token.chainName : ''
        },
        /**
         * Returns the selected origin token object
         * @param state
         */
        getOriginToken(state) {
            return (): IToken | undefined => {
                return state.tokens
                    .find(token => {
                        return (
                            token.chainId === state.originChainId &&
                            token.address === state.originTokenAddress
                        )
                    })
            }
        },
        /**
         * Returns the selected destination token object
         * @param state
         */
        getDestinationToken(state) {
            return (): IToken | undefined => {
                return state.tokens
                    .find(token => {
                        return (
                            token.chainId === state.destinationChainId &&
                            token.address === state.destinationTokenAddress
                        )
                    })
            }
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
         * Returns whether the tokens belong to the same chain
         */
        sameChainAssets(): boolean {
            return this.originChainId === this.destinationChainId
        }
    },
    actions: {
        /**
         * Loads tokens list from API
         */
        async fetchTokens() {
            this.tokens = await swidgeApi.fetchTokens()
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
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useTokensStore, import.meta.hot))
