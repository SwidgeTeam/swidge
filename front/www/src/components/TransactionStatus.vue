<script setup lang='ts'>
import ProcessingLabel from './ProcessingLabel.vue'
import CompletedLabel from './CompletedLabel.vue'
import StatusArrow from './svg/StatusArrow.vue';
import TokenLogo from './TokenLogo.vue';
import ChainLogo from './ChainLogo.vue';

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
                <div class="relative scale-100 has-tooltip">
                    <span
                        class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{
                            tokenNameIn
                        }}</span>
                    <TokenLogo  :src="tokenLogoIn"/>
                    <ChainLogo  :src="chainLogoIn"/>
                </div>
                <div class="flex justify-center pt-5">{{ amountIn }}</div>
            </div>
            <div class="grid place-content-center w-full object-center mb-12">
                <StatusArrow />
            </div>
            <div class="w-full grid place-content-center p-2 relative">
                <div class="relative scale-100 has-tooltip">
                    <span
                        class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{
                            tokenNameOut
                        }}</span>
                    <TokenLogo  :src="tokenLogoOut"/>
                    <ChainLogo  :src="chainLogoOut"/>
                </div>
                <div class="flex justify-center pt-5">{{ amountOut }}</div>
            </div>
        </div>
    </div>

</template>
