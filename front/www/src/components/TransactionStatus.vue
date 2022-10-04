<script setup lang="ts">
// import ProcessingLabel from './ProcessingLabel.vue'
// import StatusArrow from './svg/StatusArrow.vue'
import TransactionStatusDetails from './TransactionStatusDetails.vue'
import { TransactionStatus } from '@/api/models/get-status-check'
import { CheckIcon } from '@heroicons/vue/outline'
import BridgeStepArrow from './svg/BridgeStepArrow.vue'
import StatusLoading from './svg/StatusLoading.vue'

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
    txHash: string
    destinationTxHash: string
    explorerOriginTxUrl: string
    explorerDestinationTxUrl: string
}>()
</script>

<template>
    <div class="gradient-border-header-main p-2 mb-4">
        <div class="flex items-center justify-between">
            <div class="font-light">{{ date }}</div>
            <div
                class="h-6 w-6 rounded-full flex items-center justify-center p-[1px]"
                :class="{'bg-[#1CBA3E]': status === TransactionStatus.Success}"
            >
                <CheckIcon
                    v-if="status === TransactionStatus.Success"
                    class="h-5 w-5 font-extrabold stroke-[4px]"/>
                <StatusLoading
                    v-if="status === TransactionStatus.Pending"
                    class="h-7 w-7 font-extrabold stroke-[4px] fill-[#B22F7F] fill-cyan-500"/>
            </div>
        </div>
        <div class="flex">
            <TransactionStatusDetails
                :amount="amountIn"
                :token-name="tokenNameIn"
                :token-logo="tokenLogoIn"
                :chain-logo="chainLogoIn"
                :tx-hash="txHash"
                :explorer-tx-url="explorerOriginTxUrl"
            />
            <div class="flex flex-[0.2] items-center justify-center mb-8 w-full">
                <BridgeStepArrow
                    class="h-[2rem] w-[2rem] md:h-[4rem] md:w-[3rem]"
                />
            </div>
            <TransactionStatusDetails
                :amount="amountOut"
                :token-name="tokenNameOut"
                :token-logo="tokenLogoOut"
                :chain-logo="chainLogoOut"
                :tx-hash="destinationTxHash"
                :explorer-tx-url="explorerDestinationTxUrl"
            />
        </div>
    </div>
</template>
