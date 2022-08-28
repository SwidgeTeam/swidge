import { mount } from '@vue/test-utils'
import RouteCard from '@/components/RoutesCard.vue'
import RouteMother from '../store/routes.mother'
import { createTestingPinia } from '@pinia/testing'
import { useTokensStore } from '@/store/tokens'
import { TokensMother } from '../store/tokens.mother'

test('route details are correctly displayed', async () => {
    // Arrange
    const wrapper = mount(RouteCard, {
        props: {
            route: RouteMother.route()
        },
        global: {
            plugins: [createTestingPinia()],
        },
    })

    const tokensStore = useTokensStore()
    tokensStore.tokens = TokensMother.list()

    // Assert
    expect(wrapper.find('.field--global-fee').text()).toEqual('0.50415632')
    expect(wrapper.find('.field--amount-out').text()).toEqual('77.144799376959137804')
})
