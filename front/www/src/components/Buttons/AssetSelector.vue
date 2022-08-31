<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { useTokensStore } from '@/store/tokens'
import { Networks } from '@/domain/chains/Networks'

const tokensStore = useTokensStore()

const props = defineProps<{
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'open-token-list'): void
}>()

const onFallbackImgHandler = (e: Event) => {
    const token = getToken()
    if (token) {
        const chain = Networks.get(token.chainId)
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = chain.icon
    }
}

const getToken = () => {
    if (props.isOrigin) {
        return tokensStore.getOriginToken()
    } else {
        return tokensStore.getDestinationToken()
    }
}

const getChainName = (): string => {
    const token = getToken()
    return token ? token.chainName : ''
}

const getTokenLogo = (): string => {
    const token = getToken()
    return token ? token.logo : ''
}

const getTokenSymbol = (): string => {
    const token = getToken()
    return token ? token.symbol : ''
}
</script>

<template>
    <div
        class="asset-selector"
        @click="emits('open-token-list')"
    >
        <div
            v-if="getToken()"
            class="flex flex-col text-sm font-extralight"
        >
            <span>{{ getChainName() }}</span>
            <div class="flex items-center gap-2 text-xl">
                <div class="flex gap-2 items-center">
                    <img
                        :src="getTokenLogo()"
                        class="rounded-full"
                        width="24"
                        height="24"
                        @error="onFallbackImgHandler"
                    />
                    <span class="flex py-2 min-w-[rem]">
                        {{
                            getTokenSymbol()
                        }}
                    </span>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-align-center text-md font-light py-2 pl-4">Select</div>
        <div
            v-if="getToken()"
            class="items-center gap-2 text-xl"
        >
            <ChevronDownIcon class="h-6"/>
        </div>
        <div
            v-else
            class="flex items-center gap-2 text-xl pr-2"
        >
            <ChevronDownIcon class="h-6"/>
        </div>
    </div>
</template>
