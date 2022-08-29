import { mount } from '@vue/test-utils'
import RouteCard from '@/components/RoutesCard.vue'
import RouteMother from '../store/routes.mother'
import { createTestingPinia, TestingPinia } from '@pinia/testing'
import { useTokensStore } from '@/store/tokens'
import { TokensMother } from '../store/tokens.mother'
import Route from '@/domain/paths/path'
import { setActivePinia, getActivePinia } from 'pinia'

describe('route card', function () {
    beforeEach(() => {
        setActivePinia(createTestingPinia())
    })

    test('route general details are correctly displayed', async () => {
    // Arrange
        prepareTokenStore()
        const wrapper = mountRouteWith(RouteMother.default())

        // Assert
        expect(wrapper.find('.field--global-fee').text()).toEqual('$ 0.50')
        expect(wrapper.find('.field--amount-out .amount-tokens').text()).toEqual('77.14')
        expect(wrapper.find('.field--amount-out .amount-dollars').text()).toEqual('≈ $ 77.14')
    })

    test('fast route shows time in seconds', async () => {
    // Arrange
        prepareTokenStore()
        const wrapper = mountRouteWith(RouteMother.fastRoute())

        // Assert
        expect(wrapper.find('.field--execution-time').text()).toEqual('30s')
    })

    test('slow route shows time in minutes', async () => {
    // Arrange
        prepareTokenStore()
        const wrapper = mountRouteWith(RouteMother.slowRoute())

        // Assert
        expect(wrapper.find('.field--execution-time').text()).toEqual('6m')
    })
})

function prepareTokenStore() {
    const tokensStore = useTokensStore()
    tokensStore.tokens = TokensMother.list()
    tokensStore.originChainId = '250'
    tokensStore.originTokenAddress = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
    tokensStore.destinationChainId = '137'
    tokensStore.destinationTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    return tokensStore
}

function mountRouteWith(route: Route) {
    return mount(RouteCard, {
        props: {
            route: route,
            unique: 1
        },
        global: {
            plugins: [getActivePinia() as TestingPinia],
        },
    })
}
