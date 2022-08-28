import { setActivePinia, createPinia } from 'pinia'
import { useRoutesStore } from '@/store/routes'
import RouteMother from './routes.mother'

describe('Routes store', () => {
    beforeEach(() => {
        // creates a fresh pinia and make it active so it's automatically picked
        // up by any useStore() call without having to pass it to it:
        // `useStore(pinia)`
        setActivePinia(createPinia())
    })

    it('slippage default and storing value', () => {
        const routes = routesStore()
        expect(routes.getSlippage).toEqual('2')
        routes.setSlippage('1')
        expect(routes.getSlippage).toEqual('1')
    })

    it('gas priority default and storing value', () => {
        const routes = routesStore()
        expect(routes.getGasPriority).toEqual('medium')
        routes.setGasPriority('fast')
        expect(routes.getGasPriority).toEqual('fast')
    })
})

function routesStore() {
    const routes = useRoutesStore()
    routes.routes = [RouteMother.default()]
    return routes
}
