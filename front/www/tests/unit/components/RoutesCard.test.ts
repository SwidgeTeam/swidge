import { mount } from '@vue/test-utils'
import RouteCard from '@/components/RoutesCard.vue'
import RouteMother from '../store/routes.mother'
import { createTestingPinia } from '@pinia/testing'
import { useTokensStore } from '@/store/tokens'
import { TokensMother } from '../store/tokens.mother'
import Route from '@/domain/paths/path'


test('route general details are correctly displayed', async () => {
    // Arrange
    const wrapper = mountRouteWith(RouteMother.default())
    const tokensStore = useTokensStore()
    tokensStore.tokens = TokensMother.list()

    // Assert
    expect(wrapper.find('.field--global-fee').text()).toEqual('0.50')
    expect(wrapper.find('.field--amount-out').text()).toEqual('77.144799376959137804')
})

test('fast route shows time in seconds', async () => {
    // Arrange
    const wrapper = mountRouteWith(RouteMother.fastRoute())
    const tokensStore = useTokensStore()
    tokensStore.tokens = TokensMother.list()

    // Assert
    expect(wrapper.find('.field--execution-time').text()).toEqual('30s')
})

test('slow route shows time in minutes', async () => {
    // Arrange
    const wrapper = mountRouteWith(RouteMother.slowRoute())
    const tokensStore = useTokensStore()
    tokensStore.tokens = TokensMother.list()

    // Assert
    expect(wrapper.find('.field--execution-time').text()).toEqual('6m')
})

function mountRouteWith(route: Route) {
    return mount(RouteCard, {
        props: {
            route: route
        },
        global: {
            plugins: [createTestingPinia()],
        },
    })
}
