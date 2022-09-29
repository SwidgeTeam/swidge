<script setup lang="ts">
import { computed } from 'vue'
import { useRoutesStore } from '@/store/routes'
import AmountFormatter from '@/domain/shared/AmountFormatter'

const routesStore = useRoutesStore()

const props = defineProps<{
    amountIn: string
    amountOut: string
}>()


const amountOut = computed({
    get: () => {
        return AmountFormatter.format(props.amountOut)
    },
    set: () => null
})

const outputDollarValue = computed({
    get: () => {
        const amount = computeDollarValue(props.amountOut, routesStore.getDestinationToken()?.price)
        return AmountFormatter.format(amount.toFixed(2))
    },
    set: () => null
})

const priceChangePercentage = computed({
    get: () => {
        const inputDollarValue = computeDollarValue(props.amountIn, routesStore.getOriginToken()?.price)
        const outputDollarValue = computeDollarValue(props.amountOut, routesStore.getDestinationToken()?.price)
        const pricePercentage = ((outputDollarValue) / (inputDollarValue) * 100) - 100
        return pricePercentage.toFixed(2)
    },
    set: () => null
})

const computeDollarValue = (amount: string, price?: string): number => {
    if (!price) {
        return 0
    }
    return Number(amount) * Number(price)
}
</script>


<template>
    <div class="flex flex-col field--amount-out pt-2">
        <span class="amount-tokens leading-5 text-right text-2xl font-bold">{{ amountOut }}</span>
        <span class="amount-dollars leading-5 text-right text-[13px] text-slate-500 hover:text-slate-400">
            <span
                v-if="Number(priceChangePercentage) >= 0"
                class="text-green-700">({{ priceChangePercentage }}%)</span>
            <span
                v-else-if="Number(priceChangePercentage) < 0 && Number(priceChangePercentage) > -2"
                class="text-yellow-700">({{ priceChangePercentage }}%)</span>
            <span
                v-else
                class="text-red-700">({{ priceChangePercentage }}%)</span> ~ $ {{ outputDollarValue }}
        </span>
    </div>
</template>
