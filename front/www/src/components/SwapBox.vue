<script setup lang='ts'>
import BridgeSwapSelectionCard from './BridgeSwapSelectionCard.vue'
import SwitchButton from './Buttons/SwitchButton.vue'
import TransactionDetails from './TransactionDetails.vue'
import BridgeSwapInteractiveButton from './BridgeSwapInteractiveButton.vue'
import {AdjustmentsIcon} from '@heroicons/vue/solid'
import ModalSettings from './Modals/ModalSettings.vue'
import { ref } from 'vue'

const gasValue = ref<string | null>('')

defineProps<{
    sourceTokenAmount: string
    destinationTokenAmount: string
    sourceTokenMaxAmount: string
    buttonText: string
    isGettingQuote: boolean
    isExecuteButtonDisabled: boolean
    isSettingsModalOpen: boolean
    transactionFees: string
}>()

const emits = defineEmits<{
    (event: 'update:source-token-amount', value: string): void
    (event: 'source-input-changed'): void
    (event: 'select-source-token'): void
    (event: 'select-destination-token'): void
    (event: 'switch-tokens'): void
    (event: 'execute-transaction'): void

}>()

const storeGasSetting = (input: string) => {
    gasValue.value = input
    console.log(gasValue.value)
  return gasValue.value
} 

</script>

<template>
    <div class="flex flex-col gap-6 px-12 py-6 rounded-3xl bg-cards-background-dark-grey">
        <div class="flex flex-col w-full gap-4">
            <span class="relative text-2xl">
                You send:
                    <AdjustmentsIcon 
                        class="absolute w-7 right-0 top-0 cursor-pointer"
                        @click="isSettingsModalOpen = true"
                    />
            </span>
            
            <BridgeSwapSelectionCard
                :value="sourceTokenAmount"
                :is-origin="true"
                :disabled-input="false"
                :balance="sourceTokenMaxAmount"
                @update:value="(value) => emits('update:source-token-amount', value)"
                @input-changed="() => emits('source-input-changed')"
                @open-token-list="() => emits('select-source-token')"
            />
        </div>
        <div>
            <SwitchButton @switch="() => emits('switch-tokens')"/>
        </div>
        <div class="flex flex-col w-full gap-4">
            <span class="text-2xl">You receive:</span>
            <BridgeSwapSelectionCard
                :value="destinationTokenAmount"
                :is-origin="false"
                :disabled-input="true"
                @open-token-list="() => emits('select-destination-token')"
            />
        </div>
        <TransactionDetails
            v-if="transactionFees"
            :total-fee="transactionFees"
        />
        <BridgeSwapInteractiveButton
            :text="buttonText"
            :is-loading="isGettingQuote"
            :disabled="isExecuteButtonDisabled"
            :on-click="() => emits('execute-transaction')"
        />
        <ModalSettings 
        :is-open="isSettingsModalOpen"
        @close-modal="isSettingsModalOpen = false"
        @send-update-gas-value="(input) => storeGasSetting(input)"
        />
    </div>
</template>
