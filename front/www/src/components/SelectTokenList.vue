<script setup lang='ts'>
import TokenDisplay from './TokenDisplay.vue'
import NetworkAndTokenNothingFound from './NetworkAndTokenNothingFound.vue'
import { INetwork } from '@/domain/chains/INetwork'
import { useTokensStore } from '@/store/tokens'
import IToken from '@/domain/tokens/IToken'
import { computed } from 'vue'

const tokensStore = useTokensStore()

const props = defineProps<{
    chainList: INetwork[]
    selectedNetworkId: string
    searchTerm: string
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'set-token', token: IToken): void
}>()

const filteredTokens = computed({
    get: () => {
        let tokens: IToken[]

        if (props.selectedNetworkId) {
            // If there's a selected network, get only the chain's tokens
            tokens = tokensStore.getChainTokens(props.selectedNetworkId)
        } else {
            // Otherwise get them all
            tokens = tokensStore.getTokens
        }

        const pattern = props.searchTerm.toLowerCase().trim()

        if (pattern) {
            // If there's a search pattern, filter only those that match
            tokens = tokens
                .filter(token => {
                    return (
                        token.name.toLowerCase().includes(pattern) ||
                        token.symbol.toLowerCase().includes(pattern) ||
                        token.chainName.toLowerCase().includes(pattern)
                    )
                })
        }

        return tokens
    },
    set: () => null,
})

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
                v-if="selectedNetworkId === '' && searchTerm === ''"
            />
            <ul
                v-else
                class="text-base flex flex-col mt-6">
                <li
                    v-for="(token, index) in filteredTokens"
                    :key="index"
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
