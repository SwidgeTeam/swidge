<script setup lang='ts'>
import TokenDisplay from './TokenDisplay.vue'
import NetworkAndTokenNothingFound from './NetworkAndTokenNothingFound.vue'
import { INetwork } from '@/domain/chains/INetwork'
import IToken from '@/domain/tokens/IToken'

const props = defineProps<{
    chainList: INetwork[]
    tokens: IToken[]
    selectedNetworkId: string
    searchTerm: string
    isOrigin: boolean
    customTokens: boolean
}>()

const emits = defineEmits<{
    (event: 'set-token', token: IToken): void
    (event: 'import-token', token: IToken): void
}>()

const clickOnToken = (token: IToken) => {
    if (props.customTokens) {
        emits('import-token', token)
    } else {
        emits('set-token', token)
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
                v-if="selectedNetworkId === '' && searchTerm === ''"
            />
            <ul
                v-else
                class="text-base flex flex-col mt-6">
                <li
                    v-for="(token, index) in tokens"
                    :key="index"
                    class="hover:bg-cards-background-dark-grey py-3 rounded-xl cursor-pointer"
                    @click="() => clickOnToken(token)"
                >
                    <TokenDisplay
                        :token="token"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>
