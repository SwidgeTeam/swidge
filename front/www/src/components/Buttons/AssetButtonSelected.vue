<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'
import { IToken } from '@/domain/metadata/Metadata'
import { useMetadataStore } from '@/store/metadata'

const metadataStore = useMetadataStore()

const props = defineProps<{
    isOrigin: boolean
    token: IToken
}>()

const getChainLogo = () => {
    const chain = metadataStore.getChain(props.token.chainId)
    return chain ? chain.logo : ''
}
</script>

<template>
    <div
        class="flex relative has-tooltip items-center gap-2 text-xl px-2 py-1 font-extralight"
    >
        <div class="relative w-6">
            <TokenLogo
                :token-logo="token.logo"
                :chain-logo="getChainLogo()"
                size="24"
            />
            <ChainLogo :logo="getChainLogo()" size="12" />
        </div>
        <span class="flex text-sm py-2 md:text-xl">
            {{ token.symbol }}
        </span>
        <ChevronDownIcon class="h-5" />
    </div>
</template>
