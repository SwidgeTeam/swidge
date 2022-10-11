<script setup lang="ts">
import TokenLogo from '../Icons/TokenLogo.vue'
import ChainLogo from '../Icons/ChainLogo.vue'
import AmountFormatter from '@/domain/shared/AmountFormatter'
import CopyButton from '@/components/Buttons/CopyButton.vue'

defineProps<{
    amount: string
    tokenSymbol: string
    tokenLogo: string
    chainLogo: string
    txHash: string
    explorerTxUrl: string
}>()

const fixedAmount = (amount: string) => {
    let number = Number(amount)
    if (number > 1000000) {
        number /= 1000000
        if (number > 1000) {
            number /= 1000
            return AmountFormatter.format(number.toString(), 0) + ' B'
        }
        return AmountFormatter.format(number.toString()) + ' M'
    }
    return AmountFormatter.format(amount)
}

const trimmedTxnHash = (txHash: string) => {
    return `${txHash.slice(0, 4)}....${txHash.slice(-4)}`
}
</script>

<template>
    <div class="flex flex-col items-flex-start justify-between gap-3 flex-[0.4] w-28">
        <div class="flex items-center gap-2">
            <div class="relative">
                <TokenLogo
                    :token-logo="tokenLogo"
                    :chain-logo="chainLogo"
                    size="22"
                />
                <ChainLogo :logo="chainLogo" size="14"/>
            </div>
            <div
                class="flex w-14 justify-center text-xs"
                :class="amount === '0' ? 'blur' : ''"
            >
                {{ fixedAmount(amount) }}
            </div>
            <span class="flex w-10 font-medium text-slate-400 text-xs">{{ tokenSymbol }}</span>
        </div>
        <div v-if="txHash" class="flex w-full">
            <div class="flex rounded-lg px-2 py-1 gap-2 bg-[#83789B26]">
                <a
                    :href="explorerTxUrl"
                    target="_blank"
                    class="link text-xs"
                    :class="txHash === '' ? 'blur' : ''"
                >
                    {{ trimmedTxnHash(txHash) }}
                </a>
                <CopyButton :content="txHash"/>
            </div>
        </div>
    </div>
</template>
