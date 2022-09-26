<script setup lang='ts'>
import { IChain, IToken } from '@/domain/metadata/Metadata'
import { ethers } from 'ethers'

const props = defineProps<{
    token: IToken
    chain: IChain | undefined
}>()

const formattedBalance = () => {
    const amount = Number(ethers.utils.formatUnits(props.token.balance, props.token.decimals))
    const decimals = amount > 1 ? 2 : 5
    return Number(amount.toFixed(decimals))
}
</script>

<template>
    <div class="flex justify-between items-center px-2">
        <div class="flex items-center gap-2">
            <div v-lazy-container="{ selector: 'img' }">
                <img
                    :data-src="token.logo"
                    :data-error="chain?.logo"
                    class="rounded-full overflow-hidden block h-9"
                />
            </div>
            <div class="flex flex-col">
                <span>{{ token.symbol }}</span>
                <div class="flex items-center gap-2">
                    <img
                        v-lazy="chain?.logo"
                        class="overflow-hidden rounded-sm block h-3"
                    >
                    <span class="text-xs">{{ chain?.name }}</span>
                </div>
            </div>
        </div>
        <span>{{ formattedBalance() }}</span>
    </div>
</template>
