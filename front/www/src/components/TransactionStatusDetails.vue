<script setup lang="ts">
import TokenLogo from './Icons/TokenLogo.vue'
import ChainLogo from './Icons/ChainLogo.vue'
import CopyIcon from './Icons/CopyIcon.vue'

defineProps<{
    amount: string
    tokenName: string
    tokenLogo: string
    chainLogo: string
    txnHash: string
}>()

const fixedAmount = (amount: number) => {
    const fixedAmount = Number(amount)
    if (fixedAmount === 0) {
        return '0'
    } else {
        return fixedAmount.toFixed(2)
    }
}

const trimmedTxnHash = (txnHash: string) => {
    return `${txnHash.slice(0, 4)}....${txnHash.slice(-4)}`
}
const copyHash = (txnHash: string) => {
    navigator.clipboard.writeText(txnHash)
}
</script>

<template>
    <div class="flex items-center gap-2 md:gap-3">
        <div class="relative scale-100 has-tooltip">
            <span
                class="tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2"
            >
                {{ tokenName }}
            </span>
            <TokenLogo
                :token-logo="tokenLogo"
                :chain-logo="chainLogo"
                size="50"
            />

            <ChainLogo :logo="chainLogo" size="25" />
        </div>
        <span class="flex-[0.2] sm:text-md md:text-xl">{{ tokenName }}</span>
        <div
            class="flex relative overflow-visible justify-center text-md md:text-xl font-bold flex-[0.4]"
            :class="amount === '0' ? 'blur' : ''"
        >
            {{ fixedAmount(+amount) }}
        </div>
    </div>

    <div
        v-if="txnHash"
        class="flex items-center gap-2 bg-[#83789B26] w-[max-content] px-2 py-1 rounded-lg"
    >
        <a
            id="txnHash"
            :href="'https://etherscan.io/tx/:' + txnHash"
            target="_blank"
            class="text-[#6C9CE4] underline decoration-1 underline-offset-2 font-light text-sm"
            >{{ trimmedTxnHash(txnHash) }}</a
        >
        <CopyIcon class="h-4 w-4 cursor-pointer" @click="copyHash(txnHash)" />
        <!-- <ClipboardCopyIcon
            class="h-4 w-4 cursor-pointer"
            @click="copyHash(txnHash)"
        /> -->
    </div>
</template>
