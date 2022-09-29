<script setup lang="ts">
import { computed, ref } from 'vue'
import SwapInterface from '@/components/SwapInterface.vue'
import QuestionMark from '@/components/svg/QuestionMark.vue'
import ModalFaq from '@/components/Modals/ModalFaq.vue'

const isFaqOpen = ref(false)

const year = computed({
    get: () => {
        return new Date().getFullYear()
    },
    set: () => null,
})
</script>

<template>
    <div class="flex flex-col md:w-[453px]">
        <SwapInterface />
        <div class="flex justify-center">
            <div
                class="flex justify-between px-4 py-2 h-16 font-extralight text-xs sm:text-base w-full max-w-sm md:max-w-xl"
            >
                <div class="flex flex-col">
                    <span>This is a beta version</span>
                    <span class="text-xs">{{ year }} - Swidge</span>
                </div>
                <QuestionMark @click="isFaqOpen = true" />
            </div>
        </div>
    </div>
    <ModalFaq :is-open="isFaqOpen" @close="isFaqOpen = false" />
</template>

<route lang="yaml">
name: Swap
layout: MainLayout
</route>
