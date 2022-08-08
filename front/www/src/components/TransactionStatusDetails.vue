<script setup lang='ts'>
import TokenLogo from './TokenLogo.vue'
import ChainLogo from './ChainLogo.vue'

defineProps<{
    amount: string
    tokenName: string
    tokenLogo: string
    chainLogo: string
}>()

</script>

<template>
    <div class="relative scale-100 has-tooltip">
        <span
            class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>
            {{ tokenName }}
        </span>
        <TokenLogo :token-logo="tokenLogo"/>
        <ChainLogo :chain-logo="chainLogo"/>
    </div>
    <div class="flex justify-center pt-5">{{ amount }}</div>
</template>
