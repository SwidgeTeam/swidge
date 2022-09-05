import { acceptHMRUpdate, defineStore } from 'pinia'
import swidgeApi from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { IChain, IToken } from '@/domain/metadata/Metadata'

const CUSTOM_TOKENS_STORAGE_KEY = 'custom-tokens'

export const useMetadataStore = defineStore('metadata', {
    state: () => ({
        tokens: [] as IToken[],
        chains: [] as IChain[],
    }),
    getters: {
        /**
         * Returns whole list of tokens
         */
        getTokens(): IToken[] {
            return this.tokens
        },
        /**
         * Returns whole list of chains
         */
        getChains(): IChain[] {
            return this.chains
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
         * Returns a specific chain
         * @param state
         */
        getChain(state) {
            return (chainId: string): IChain => {
                const chain = state.chains
                    .find(chain => {
                        return chain.id === chainId
                    })
                if (!chain) {
                    throw new Error('Unsupported chain')
                }
                return chain
            }
        },
        /**
         * Returns a token given chainId and address
         * @param state
         */
        getToken(state) {
            return (chainId: string, address: string): IToken | undefined => {
                return state.tokens
                    .find(token => {
                        return token.chainId === chainId && token.address.toLowerCase() === address.toLowerCase()
                    })
            }
        },
        /**
         * Returns a token given chainId and address
         * @param state
         */
        getTokensByAddress(state) {
            return (address: string): IToken[] | undefined => {
                return state.tokens
                    .filter(token => {
                        return token.address.toLowerCase() === address.toLowerCase()
                    })
            }
        },
    },
    actions: {
        /**
         * Loads tokens list from API
         */
        async fetchMetadata() {
            const metadata = await swidgeApi.fetchMetadata()
            this.tokens = metadata.tokens
            this.chains = metadata.chains
            const customTokens = getCustomTokens()
            if (customTokens) {
                this.tokens.push(...customTokens)
            }
        },
        /**
         * Loads token balances
         */
        async fetchBalances(wallet: string) {
            const tokenBalances = await swidgeApi.fetchBalances(wallet)
            this.tokens = this.tokens.map(token => {
                const tokenBalance = tokenBalances.find(tokenBalance => {
                    return tokenBalance.chainId === token.chainId && tokenBalance.address === token.address
                })
                if (tokenBalance) {
                    token.balance = tokenBalance.balance
                }
                return token
            })
        },
        /**
         * Imports a token into the list if it doesn't exist already
         * @param token
         */
        importToken(token: IToken) {
            const customTokens = getCustomTokens()
            const exists = customTokens.find(t => {
                return t.address === token.address && t.chainId === t.chainId
            })
            if (!exists) {
                customTokens.push(token)
                setCustomTokens(customTokens)
                this.tokens.push(token)
                swidgeApi.addImportedToken({
                    chainId: token.chainId,
                    address: token.address,
                    wallet: useWeb3Store().account,
                })
            }
        },
    },
})

function getCustomTokens(): IToken[] {
    const rawCustomTokens = localStorage.getItem(CUSTOM_TOKENS_STORAGE_KEY)
    return rawCustomTokens
        ? JSON.parse(rawCustomTokens)
        : []
}

function setCustomTokens(customTokens: IToken[]) {
    localStorage.setItem(CUSTOM_TOKENS_STORAGE_KEY, JSON.stringify(customTokens))
}

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
