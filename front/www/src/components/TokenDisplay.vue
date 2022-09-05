<script setup lang='ts'>
import { IChain, IToken } from '@/domain/metadata/Metadata'
import { ethers } from 'ethers'

const props = defineProps<{
    token: IToken
    chain: IChain | undefined
}>()

const formattedBalance = () => {
    return Number(ethers.utils.formatUnits(props.token.balance, props.token.decimals)).toFixed(2)
}
</script>

<template>
    <div class="flex justify-between items-center px-2">
        <div class="flex items-center gap-2">
            <div v-lazy-container="{ selector: 'img' }">
                <img
                    :data-src="token.logo"
                    :data-error="chain?.logo"
                    :alt="token.symbol + ' ' + 'icon'"
                    class="rounded-full overflow-hidden block h-9"
                />
            </div>
            <div class="flex flex-col">
                <span>{{ token.symbol }}</span>
                <div class="flex items-center gap-2">
                    <img
                        v-lazy="chain?.logo"
                        class="rounded-full overflow-hidden block h-4"
                        :alt="chain?.name + ' ' + 'icon'">
                    <span class="text-xs">{{ chain?.name }}</span>
                </div>
            </div>
        </div>
        <span>{{ formattedBalance() }}</span>
    </div>
</template>
