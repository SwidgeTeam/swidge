import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import GetQuoteRequest from '@/api/models/get-quote-request'
import Route from '@/domain/paths/path'

export const useRoutesStore = defineStore('routes', {
    state: () => ({
        routes: [] as Route[],
        selectedRoute: 0
    }),
    getters: {
        getSelectedRoute(): Route {
            return this.routes[this.selectedRoute]
        }
    },
    actions: {
        /**
         * Fetches the routes for a specific path
         * @param payload
         */
        async quotePath(payload: GetQuoteRequest) {
            this.routes = await SwidgeAPI.getQuote(payload)
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
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useRoutesStore, import.meta.hot))
