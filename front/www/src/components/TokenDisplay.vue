<script setup lang='ts'>
import IToken from '@/domain/tokens/IToken'
import { Networks } from '@/domain/chains/Networks'

const props = defineProps<{
    token: IToken
}>()

const replaceByDefault = (e: Event) => {
    const chain = Networks.get(props.token.chainId)
    const imageTarget = e.target as HTMLImageElement
    imageTarget.src = chain.icon
}

</script>

<template>
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
            <img
                v-lazy="token.logo"
                width="35"
                height="35"
                class="rounded-full overflow-hidden block"
                :alt="token.symbol + '' + 'icon'"
                @error="replaceByDefault($event)">
            <span>{{ token.symbol }}</span>
            <span class="font-extralight">{{ token.name }}</span>
        </div>
        <span>{{ token.chainName }}</span>
    </div>
</template>
