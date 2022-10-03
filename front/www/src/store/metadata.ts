import { acceptHMRUpdate, defineStore } from 'pinia'
import swidgeApi from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { IChain, IToken, ITokenList } from '@/domain/metadata/Metadata'
import { flatten } from 'lodash'

const CUSTOM_TOKENS_STORAGE_KEY = 'custom-tokens'

export const useMetadataStore = defineStore('metadata', {
    state: () => ({
        tokens: {} as ITokenList,
        chains: [] as IChain[],
        balances: [] as IToken[],
        emptyPrices: true,
    }),
    getters: {
        /**
         * Returns whole list of tokens
         */
        getAllTokens(): IToken[] {
            return flatten(Object.values(this.tokens))
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
                return state.tokens[chainId]
            }
        },
        /**
         * Returns a specific chain
         * @param state
         */
        getChain(state) {
            return (chainId: string): IChain | undefined => {
                return state.chains
                    .find(chain => {
                        return chain.id === chainId
                    })
            }
        },
        /**
         * Returns a token given chainId and address
         * @param state
         */
        getToken(state) {
            return (chainId: string, address: string): IToken | undefined => {
                const list = state.tokens[chainId]
                return list
                    ? list.find(token => {
                        return token.address.toLowerCase() === address.toLowerCase()
                    })
                    : undefined
            }
        },
        /**
         * Returns a token given chainId and address
         */
        getTokensByAddress() {
            return (address: string): IToken[] | undefined => {
                return this.getAllTokens
                    .filter(token => {
                        return token.address.toLowerCase() === address.toLowerCase()
                    })
            }
        },
        /**
         * returns the URL for the TX on the chain explorer
         */
        getExplorerTxUrl() {
            return (chainId: string, txHash: string): string => {
                const chain = this.getChain(chainId)
                return chain
                    ? chain.metamask.blockExplorerUrls[0] + '/tx/' + txHash
                    : ''
            }
        },
        /**
         * returns the list of tokens that hold balance
         */
        getBalances(): IToken[] {
            return this.balances
        }
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
                for (const token of customTokens) {
                    this.tokens[token.chainId].push(...customTokens)
                }
            }
        },
        /**
         * Loads token balances
         */
        async fetchBalances(wallet: string) {
            const tokenBalances = await swidgeApi.fetchBalances(wallet)
            this.emptyPrices = tokenBalances.empty
            for (const [chainId, tokens] of Object.entries(this.tokens)) {
                this.tokens[chainId] = tokens.map(token => {
                    const tokenBalance = tokenBalances.tokens.find(tokenBalance => {
                        return tokenBalance.chainId === token.chainId && tokenBalance.address === token.address
                    })
                    if (tokenBalance) {
                        token.balance = tokenBalance.balance
                        this.balances.push(token)
                    }
                    return token
                })
            }
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
                this.tokens[token.chainId].push(token)
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
