<script setup lang='ts'>
import TokenLogo from './Icons/TokenLogo.vue'
import ChainLogo from './Icons/ChainLogo.vue'

defineProps<{
    amount: string
    tokenName: string
    tokenLogo: string
    chainLogo: string
}>()

const fixedAmount = (amount: number) => {
    const fixedAmount = Number(amount)
    if (fixedAmount === 0) {
        return '0'
    } else {
        return fixedAmount.toFixed(6)
    }
}

</script>

<template>
    <div class="relative scale-100 has-tooltip">
        <span
            class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>
            {{ tokenName }}
        </span>
            <TokenLogo :logo="tokenLogo" size="64"/>
            <ChainLogo :logo="chainLogo" size="48"/>
    </div>
    <div
        class="flex pt-4 relative overflow-visible justify-center"
        :class="amount === '0' ? 'blur' : ''"
    >{{ fixedAmount(+amount) }}
    </div>
</template>
