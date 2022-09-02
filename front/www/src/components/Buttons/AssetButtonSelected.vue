<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { Networks } from '@/domain/chains/Networks'
import IToken from '@/domain/tokens/IToken'
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'

const props = defineProps<{
    isOrigin: boolean
    token: IToken
}>()

const getChainLogo = () => {
    const chain = Networks.get(props.token.chainId)
    return chain.icon
}
const onFallbackImgHandler = (e: Event) => {
    const chainLogo = getChainLogo()
    const imageTarget = e.target as HTMLImageElement
    imageTarget.src = chainLogo
}
</script>

<template>
    <div class="flex relative has-tooltip items-center gap-2 text-xl px-2 py-1 font-extralight">
        <div class="relative w-6">
            <TokenLogo :logo="token.logo" size="24"/>
            <ChainLogo :logo="getChainLogo()" size="12"/>
        </div>
        <span class="flex text-sm py-2">
            {{ token.symbol }}
        </span>
        <ChevronDownIcon class="h-5"/>
    </div>
</template>
