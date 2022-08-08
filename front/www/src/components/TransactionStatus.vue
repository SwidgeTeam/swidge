<script setup lang='ts'>
import ProcessingLabel from './ProcessingLabel.vue'
import CompletedLabel from './CompletedLabel.vue'
import StatusArrow from './svg/StatusArrow.vue';
import TransactionStatusDetails from './TransactionStatusDetails.vue'

const STATUS_PROCESSING = 'ongoing'
const STATUS_COMPLETED = 'completed'

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
            <ProcessingLabel v-if="status === STATUS_PROCESSING"/>
            <CompletedLabel v-if="status === STATUS_COMPLETED"/>
        </div>
        <div
            class="grid grid-cols-3 gap-2 flex flex-wrap justify-between grid-flow-col auto-cols-max w-full mx-16 pt-4">
            <div class="w-full grid place-content-center p-2">
                <TransactionStatusDetails 
                :amount="amountIn"
                :tokenName="tokenNameIn"
                :tokenLogo="tokenLogoIn"
                :chainLogo="chainLogoIn"
            />
            </div>
            <div class="grid place-content-center w-full object-center mb-12">
                <StatusArrow />
            </div>
            <div class="w-full grid place-content-center p-2">
                <div class="relative scale-100 has-tooltip">
                <TransactionStatusDetails 
                :amount="amountOut"
                :tokenName="tokenNameOut"
                :tokenLogo="tokenLogoOut"
                :chainLogo="chainLogoOut"
                />
            </div>
            </div>
        </div>
    </div>

</template>
