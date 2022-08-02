import { acceptHMRUpdate, defineStore } from 'pinia'
import swidgeApi from '@/api/swidge-api'
import ITokenN from '@/domain/tokens/ITokenN'

export const useTokensStore = defineStore('tokens', {
    state: () => ({
        tokens: [] as ITokenN[]
    }),
    getters: {
        getTokens(): ITokenN[] {
            return this.tokens
        },
        getChainTokens(state) {
            return (chainId: string): ITokenN[] => {
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
