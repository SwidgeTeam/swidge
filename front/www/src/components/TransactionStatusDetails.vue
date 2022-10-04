<script setup lang="ts">
import TokenLogo from './Icons/TokenLogo.vue'
import ChainLogo from './Icons/ChainLogo.vue'
import CopyIcon from './Icons/CopyIcon.vue'
import AmountFormatter from '@/domain/shared/AmountFormatter'

defineProps<{
    amount: string
    tokenName: string
    tokenLogo: string
    chainLogo: string
    txHash: string
    explorerTxUrl: string
}>()

const fixedAmount = (amount: string) => {
    const number = Number(amount)
    if (number > 1000000) {
        const millions = number / 1000000
        return AmountFormatter.format(millions.toString()) + ' M'
    }
    return AmountFormatter.format(amount)
}

const trimmedTxnHash = (txHash: string) => {
    return `${txHash.slice(0, 4)}....${txHash.slice(-4)}`
}
const copyHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
}
</script>

<template>
    <div class="flex mt-2 p-2 flex-col items-flex-start justify-between gap-3 flex-[0.4]">
        <div class="flex items-center gap-2 md:gap-3">
            <div class="relative">
                <TokenLogo
                    :token-logo="tokenLogo"
                    :chain-logo="chainLogo"
                    size="32"
                />
                <ChainLogo :logo="chainLogo" size="16"/>
            </div>
            <div
                class="flex xs:w-16 sm:w-24 justify-center text-xs sm:text-base"
                :class="amount === '0' ? 'blur' : ''"
            >
                {{ fixedAmount(amount) }}
            </div>
            <span class="flex font-medium text-slate-400 text-xs">{{ tokenName }}</span>
        </div>
        <div v-if="txHash" class="flex w-full">
            <div class="flex rounded-lg px-2 py-1 gap-2 bg-[#83789B26]">
                <a
                    id="txHash"
                    :href="explorerTxUrl"
                    target="_blank"
                    class="text-[#6C9CE4] underline decoration-1 underline-offset-2 font-light text-sm"
                >
                    {{ trimmedTxnHash(txHash) }}
                </a>
                <CopyIcon class="h-4 w-4 cursor-pointer" @click="copyHash(txHash)"/>
            </div>
        </div>
    </div>
</template>
