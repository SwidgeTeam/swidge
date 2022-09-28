<script setup lang="ts">
// import ProcessingLabel from './ProcessingLabel.vue'
// import StatusArrow from './svg/StatusArrow.vue'
import TransactionStatusDetails from './TransactionStatusDetails.vue'
import { TransactionStatus } from '@/api/models/get-status-check'
import { CheckIcon } from '@heroicons/vue/outline'
import BridgeStepArrow from './svg/BridgeStepArrow.vue'

defineProps<{
    date: string
    status: string
    tokenLogoIn: string
    chainLogoIn: string
    tokenLogoOut: string
    chainLogoOut: string
    amountIn: string
    amountOut: string
    tokenNameIn: string
    tokenNameOut: string
    txnHash: string
    destinationTxHash: string
}>()
</script>

<template>
    <div class="gradient-border-header-main p-2 mb-4">
        <div class="top flex items-center justify-between">
            <div class="font-light">{{ date }}</div>
            <div
                class="bg-[#1CBA3E] h-5 w-5 rounded-full flex items-center justify-center p-[1px]"
                v-if="status === TransactionStatus.Success"
            >
                <CheckIcon class="h-5 font-extrabold stroke-[4px]" />
            </div>
        </div>

        <div class="bottom flex">
            <div
                class="flex mt-2 p-2 flex-col items-flex-start justify-between gap-3 flex-[0.4]"
            >
                <TransactionStatusDetails
                    :amount="amountIn"
                    :token-name="tokenNameIn"
                    :token-logo="tokenLogoIn"
                    :chain-logo="chainLogoIn"
                    :txnHash="txnHash"
                />
            </div>

            <div
                class="flex flex-[0.2] items-center justify-center mb-8 w-full"
            >
                <BridgeStepArrow class="h-[4rem] w-[3.5rem]" />
            </div>

            <div
                class="flex mt-2 p-2 flex-col items-flex-start justify-between gap-3 flex-[0.4]"
            >
                <TransactionStatusDetails
                    :amount="amountOut"
                    :token-name="tokenNameOut"
                    :token-logo="tokenLogoOut"
                    :chain-logo="chainLogoOut"
                    :txnHash="destinationTxHash"
                />
            </div>
        </div>
    </div>
</template>
