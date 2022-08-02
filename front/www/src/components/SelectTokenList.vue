<script setup lang='ts'>
import TokenDisplay from './TokenDisplay.vue'
import NetworkAndTokenNothingFound from './NetworkAndTokenNothingFound.vue'
import { INetwork } from '@/models/INetwork'
import { useTokensStore } from '@/store/tokens'
import ITokenN from '@/domain/tokens/ITokenN'

const tokensStore = useTokensStore()

const props = defineProps<{
    chainList: INetwork[]
    selectedNetworkId: string
    searchTerm: string
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'set-token', token: ITokenN): void
}>()

/**
 * Retrieves and filters the token list according to the given props
 */
const filteredTokenList = (): ITokenN[] => {
    if (
        props.selectedNetworkId === '' &&
        props.searchTerm === ''
    ) {
        return tokensStore.getTokens
    } else {
        const token = tokensStore.getChainTokens(props.selectedNetworkId)
        return token.filter(
            (token: ITokenN) => {
                return (
                    token.name.toLowerCase().includes(props.searchTerm) ||
                    token.symbol.toLowerCase().includes(props.searchTerm) ||
                    token.chainName.toLowerCase() === props.searchTerm ||
                    token.chainId === props.selectedNetworkId
                )
            })
    }
}

</script>

<template>
    <div class="text-lg font-roboto">
        <div class="flex gap-6 items-center">
            <span>Select Token:</span>
            <span
                v-if="selectedNetworkId !== '' || searchTerm !== ''"
                class="text-sm font-extralight mt-1 ml-auto">Network</span>
        </div>
        <div class="h-80 w-full overflow-y-auto">
            <NetworkAndTokenNothingFound
                v-if="selectedNetworkId === '' && searchTerm === ''"/>
            <ul
                v-if="selectedNetworkId !== '' || searchTerm !== ''"
                class="text-base flex flex-col mt-6">
                <li
                    v-for="token in filteredTokenList()"
                    :key="token.address"
                    class="hover:bg-cards-background-dark-grey py-3 rounded-xl cursor-pointer"
                    @click="emits('set-token', token)"
                >
                    <TokenDisplay
                        :token="token"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>
