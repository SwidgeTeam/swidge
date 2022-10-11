<script setup lang='ts'>
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'

defineProps<{
    tokenIcon: string
    chainIcon: string
    amount: string
    symbol: string
}>()

</script>

<template>
    <div class="flex flex-col items-center w-36 gap-1">
        <div class="flex relative w-8">
            <TokenLogo
                :token-logo="tokenIcon"
                :chain-logo="chainIcon"
                size="32"
            />
            <ChainLogo :logo="chainIcon" size="14"/>
        </div>
        <div class="flex gap-2 items-center">
            <div>{{ amount }}</div>
            <div class="text-xs">{{ symbol }}</div>
        </div>
    </div>
</template>
