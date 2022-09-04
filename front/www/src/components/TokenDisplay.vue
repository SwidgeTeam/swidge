<script setup lang='ts'>
import { IChain, IToken } from '@/domain/metadata/Metadata'
import { useTokensStore } from '@/store/tokens'
import { ethers } from 'ethers'

const metadataStore = useTokensStore()

const props = defineProps<{
    token: IToken
    chain: IChain
}>()

const replaceByDefault = (e: Event) => {
    const chain = metadataStore.getChain(props.token.chainId)
    const imageTarget = e.target as HTMLImageElement
    imageTarget.src = chain.logo
}

const formattedBalance = () => {
    return ethers.utils.formatUnits(props.token.balance, props.token.decimals);
}
</script>

<template>
    <div class="flex justify-between items-center px-2">
        <div class="flex items-center gap-2">
            <img
                v-lazy="token.logo"
                class="rounded-full overflow-hidden block h-9"
                :alt="token.symbol + ' ' + 'icon'"
                @error="replaceByDefault($event)">
            <div class="flex flex-col">
                <span>{{ token.symbol }}</span>
                <div class="flex items-center gap-2">
                    <img
                        v-lazy="chain.logo"
                        class="rounded-full overflow-hidden block h-4"
                        :alt="chain.name + ' ' + 'icon'">
                    <span class="text-xs">{{ chain.name }}</span>
                </div>
            </div>
        </div>
        <span>{{ formattedBalance() }}</span>
    </div>
</template>
