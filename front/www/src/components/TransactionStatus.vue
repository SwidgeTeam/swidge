<script setup lang='ts'>
import ProcessingLabel from './ProcessingLabel.vue'
import CompletedLabel from './CompletedLabel.vue'

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
            <div class="grid flex justify-start content-center"> {{date}} </div>
            <ProcessingLabel v-if="status == 'processing'"/>
            <CompletedLabel v-if="status =='completed'"/>
        </div>
        <div class="grid grid-cols-3 gap-2 flex flex-wrap justify-between grid-flow-col auto-cols-max w-full mx-16 pt-4">
            <div class="w-full grid place-content-center p-2">
                <div class="relative scale-100 has-tooltip">
                    <span class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{tokenNameIn}}</span>
                    <img style="width: 64px; height: 64px" :src="tokenLogoIn" class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"/>
                    <img style="width: 48px; height: 48px" :src="chainLogoIn" class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"/>
                </div>
                <div class="flex justify-center pt-5">{{amountIn}}</div>
            </div>
            <div class="grid place-content-center w-full object-center mb-12">
                <svg width="82" height="16" viewBox="0 0 82 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 7C0.447715 7 4.5665e-08 7.44772 0 8C-4.5665e-08 8.55228 0.447715 9 1 9L1 7ZM81.7071 8.70711C82.0976 8.31659 82.0976 7.68342 81.7071 7.2929L75.3431 0.928939C74.9526 0.538415 74.3195 0.538415 73.9289 0.928939C73.5384 1.31946 73.5384 1.95263 73.9289 2.34315L79.5858 8.00001L73.9289 13.6569C73.5384 14.0474 73.5384 14.6806 73.9289 15.0711C74.3195 15.4616 74.9526 15.4616 75.3431 15.0711L81.7071 8.70711ZM1 9L81 9.00001L81 7.00001L1 7L1 9Z" fill="white"/>
                </svg>
            </div>
            <div class="w-full grid place-content-center p-2 relative">
                <div class="relative scale-100 has-tooltip">
                    <span class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{tokenNameOut}}</span>
                    <img  style="width: 64px; height: 64px" :src="tokenLogoOut" class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"/>
                    <img  style="width: 48px; height: 48px" :src="chainLogoOut" class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"/>
                </div>
                <div class="flex justify-center pt-5">{{amountOut}}</div>
            </div>
        </div>
    </div>

</template>