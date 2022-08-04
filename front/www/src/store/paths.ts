import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import GetQuoteRequest from '@/api/models/get-quote-request'
import Path from '@/domain/paths/path';

export const usePathsStore = defineStore('paths', {
    state: () => ({
        path: [] as Path[]
    }),
    getters: {
        getPath(): Path {
            return this.path[0]
        }
    },
    actions: {
        async quotePath(payload: GetQuoteRequest) {
            this.path = [await SwidgeAPI.getQuote(payload)]
        }
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(usePathsStore, import.meta.hot))
