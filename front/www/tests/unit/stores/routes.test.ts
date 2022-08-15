import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useRoutesStore } from '@/store/routes'
import { RoutesMother } from './routes.mother'

describe('Routes store', () => {
    beforeEach(() => {
        // creates a fresh pinia and make it active so it's automatically picked
        // up by any useStore() call without having to pass it to it:
        // `useStore(pinia)`
        setActivePinia(createPinia())
    })

    it('increments', () => {
        createTestingPinia({
            initialState: {
                routes: RoutesMother.create(),
                selectedRoute: 0,
            },
        })
        const routes = useRoutesStore()
        const route = routes.routes
        console.log(route)
    })
})