<script setup lang="ts">
import { computed } from 'vue'
import { asyncComputed } from '@vueuse/core'
import { useRoutesStore } from '@/store/routes'
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import AmountFormatter from '@/domain/shared/AmountFormatter'

const routesStore = useRoutesStore()

const emits = defineEmits<{
    (event: 'input-changed'): void
    (event: 'select-token'): void
}>()

const onChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    // Filters out all letters of the user input except numbers
    event.target.value = event.target.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1')
        .replace(/^0*(\d)/gm, '$1')

    updateValue(event.target.value)
}

const setToMaxAmount = async () => {
    const balance = await routesStore.getSelectedTokenBalance
    updateValue(AmountFormatter.format(balance))
    emits('input-changed')
}

const updateValue = (amount: string) => {
    routesStore.setAmountIn(amount)
}

const inputValue = computed({
    get: () => {
        const value = routesStore.getAmountIn
        return value ? value : ''
    },
    set: () => null,
})

const trimmedBalance = asyncComputed(
    async () => {
        return AmountFormatter.format(await routesStore.getSelectedTokenBalance)
    },
    '0'
)

const dollarValue = computed({
    get: () => {
        const token = routesStore.getOriginToken()
        if (!token) {
            return '0.0'
        }
        const amount = Number(inputValue.value) * Number(token.price)
        return AmountFormatter.format(amount.toFixed(2))
    },
    set: () => null,
})

</script>

<template>
    <div class="sending-box">
        <div class="flex items-center justify-between pb-2 pt-3">
            <AssetSelector
                :is-origin="true"
                @open-token-list="() => emits('select-token')"
            />
            <div
                class="relative flex">
                <input
                    type="text"
                    :disabled="false"
                    :value="inputValue"
                    placeholder="Enter amount"
                    class="p-0 text-right text-xl font-medium w-full bg-transparent border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
                    autocomplete="off"
                    autocorrect="off"
                    spellcheck="false"
                    min="0"
                    minlength="1"
                    maxlength="79"
                    inputmode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    @change="emits('input-changed')"
                    @input="onChange"
                />
            </div>
        </div>
        <div class="pl-2 flex items-center justify-between">
            <div class="current-balance">
                <span
                    class="cursor-pointer"
                    @click="setToMaxAmount">
                    Balance: {{ trimmedBalance }}
                </span>
            </div>
            <div class="input-dollar-value">~ $ {{ dollarValue }}</div>
        </div>
    </div>
</template>
