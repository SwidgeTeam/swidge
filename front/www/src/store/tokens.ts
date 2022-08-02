import { acceptHMRUpdate, defineStore } from 'pinia'
import { TokenListItem } from '@/domain/tokens/TokenList'
import swidgeApi from '@/api/swidge-api'

export const useTokensStore = defineStore('tokens', {
    state: () => ({
        tokens: [] as TokenListItem[]
    }),
    getters: {
        getTokens(): TokenListItem[] {
            return this.tokens
        },
        getChainTokens(state) {
            return (chainId: string): TokenListItem[] => {
                return state.tokens
                    .filter(token => {
                        return token.c === chainId
                    })
            }
        }
    },
    actions: {
        async fetchTokens() {
            const list = await swidgeApi.fetchTokens()
            this.tokens = list.list
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useTokensStore, import.meta.hot))
