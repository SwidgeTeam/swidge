import { acceptHMRUpdate, defineStore } from 'pinia'
import swidgeApi from '@/api/swidge-api'
import IToken from '@/domain/tokens/IToken'

export const useTokensStore = defineStore('tokens', {
    state: () => ({
        tokens: [] as IToken[]
    }),
    getters: {
        getTokens(): IToken[] {
            return this.tokens
        },
        getChainTokens(state) {
            return (chainId: string): IToken[] => {
                return state.tokens
                    .filter(token => {
                        return token.chainId === chainId
                    })
            }
        }
    },
    actions: {
        async fetchTokens() {
            this.tokens = await swidgeApi.fetchTokens()
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useTokensStore, import.meta.hot))
