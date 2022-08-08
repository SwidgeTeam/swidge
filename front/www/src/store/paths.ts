import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import GetQuoteRequest from '@/api/models/get-quote-request'
import Route from '@/domain/paths/path'

export const usePathsStore = defineStore('paths', {
    state: () => ({
        routes: [] as Route[]
    }),
    getters: {
        getPath(): Route {
            return this.routes[0]
        }
    },
    actions: {
        async quotePath(payload: GetQuoteRequest) {
            this.routes = await SwidgeAPI.getQuote(payload)
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(usePathsStore, import.meta.hot))
