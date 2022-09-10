<script setup lang='ts'>
import ProcessingLabel from './ProcessingLabel.vue'
import CompletedLabel from './CompletedLabel.vue'
import StatusArrow from './svg/StatusArrow.vue'
import TransactionStatusDetails from './TransactionStatusDetails.vue'
import { TransactionStatus } from '@/api/models/get-status-check'

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
}>()

</script>

<template>
    <div
        class="content-center gradient-border-header-main flex flex-wrap justify-between gap-2 mb-4 p-2">
        <div class="w-full flex justify-between">
            <div class="grid flex justify-start content-center"> {{ date }}</div>
            <ProcessingLabel v-if="status === TransactionStatus.Pending"/>
            <CompletedLabel v-if="status === TransactionStatus.Success"/>
        </div>
        <div
            class="grid grid-cols-3 gap-2 flex flex-wrap justify-between grid-flow-col auto-cols-max w-full mx-16 pt-4">
            <div class="place-content-center p-2 px-6">
                <TransactionStatusDetails
                    :amount="amountIn"
                    :token-name="tokenNameIn"
                    :token-logo="tokenLogoIn"
                    :chain-logo="chainLogoIn"
                />
            </div>
            <div class="grid place-content-center w-full object-center mb-12">
                <StatusArrow />
            </div>
            <div class="place-content-center p-2 px-6">
                <div class="display-block scale-100 has-tooltip">
                <TransactionStatusDetails
                    :amount="amountOut"
                    :token-name="tokenNameOut"
                    :token-logo="tokenLogoOut"
                    :chain-logo="chainLogoOut"
                />
                </div>
            </div>
        </div>
    </div>

</template>
