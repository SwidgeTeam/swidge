<script setup lang='ts'>
import TokenDisplay from './TokenDisplay.vue'
import NetworkAndTokenNothingFound from './NetworkAndTokenNothingFound.vue'
import { INetwork } from '@/models/INetwork'
import { useTokensStore } from '@/store/tokens'
import IToken from '@/domain/tokens/IToken'

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

/**
 * Retrieves and filters the token list according to the given props
 */
const filteredTokenList = (): IToken[] => {
    let tokens: IToken[]

    if (props.selectedNetworkId) {
        // If there's a selected network, get only the chain's tokens
        tokens = tokensStore.getChainTokens(props.selectedNetworkId)
    } else {
        // Otherwise get them all
        tokens = tokensStore.getTokens
    }

    return tokens
        .filter(token => {
            const pattern = props.searchTerm.toLowerCase().trim()
            // If there's a search pattern, filter only those that match
            return (
                pattern === '' ||
                token.name.toLowerCase().includes(pattern) ||
                token.symbol.toLowerCase().includes(pattern) ||
                token.chainName.toLowerCase().includes(pattern)
            )
        })
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
                v-if="selectedNetworkId === '' && searchTerm === ''"
            />
            <ul
                v-else
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
