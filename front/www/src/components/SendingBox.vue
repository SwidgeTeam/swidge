<script setup lang="ts">
import { computed } from 'vue'
import AssetSelector from '@/components/Buttons/AssetSelector.vue'

const props = defineProps<{
    value: string
    balance?: string
}>()

const emits = defineEmits<{
    (event: 'update:value', value: string): void
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

    emits('update:value', event.target.value)
}

const setToMaxAmount = () => {
    if (!props.balance) return
    emits('update:value', props.balance)
    emits('input-changed')
}

const trimmedBalance = computed({
    get: () => {
        const number = Number(props.balance)
        if (number === 0) {
            return '0'
        } else {
            return number.toFixed(6)
        }
    },
    set: () => null,
})
</script>

<template>
    <div class="sending-box">
        <span class="text-xs text-slate-400">You send</span>
        <div class="flex items-center justify-between py-2">
            <AssetSelector
                :is-origin="true"
                @open-token-list="() => emits('select-token')"
            />
            <div
                class="relative flex">
                <input
                    type="text"
                    :disabled="false"
                    :value="value"
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
        <div class="flex items-center justify-between">
            <div class="current-balance">
                Balance:
                <span
                    class="cursor-pointer"
                    @click="setToMaxAmount">
                        {{ trimmedBalance }}
                </span>
            </div>
            <div class="input-dollar-value">~ $ 1,234.45</div>
        </div>
    </div>
</template>
