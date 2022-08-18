import { acceptHMRUpdate, defineStore } from 'pinia'
import SwidgeAPI from '@/api/swidge-api'
import Route from '@/domain/paths/path'
import { ethers } from 'ethers'
import { useTokensStore } from '@/store/tokens'
import { useWeb3Store } from '@/store/web3'

export const useRoutesStore = defineStore('routes', {
    state: () => ({
        routes: [] as Route[],
        selectedRoute: 0,
    }),
    getters: {
        getSelectedRoute(): Route {
            return this.routes[this.selectedRoute]
        },
    },
    actions: {
        /**
         * Fetches the routes for a specific path
         * @param amount
         * @param slippage
         */
        async quotePath(amount: string, slippage: number) {
            const tokensStore = useTokensStore()
            const web3Store = useWeb3Store()
            this.routes = await SwidgeAPI.getQuote({
                fromChainId: tokensStore.getOriginChainId,
                srcToken: tokensStore.getOriginTokenAddress,
                toChainId: tokensStore.getDestinationChainId,
                dstToken: tokensStore.getDestinationTokenAddress,
                amount: amount,
                slippage: slippage,
                senderAddress: web3Store.account || ethers.constants.AddressZero,
                receiverAddress: web3Store.account || ethers.constants.AddressZero
            })
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
