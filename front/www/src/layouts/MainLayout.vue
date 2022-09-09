<script setup lang="ts">
import { computed, ref } from 'vue'
import { tryOnBeforeMount } from '@vueuse/core'
import { useMetadataStore } from '@/store/metadata'
import { useWeb3Store } from '@/store/web3'
import Header from '@/components/Header.vue'
import QuestionMark from '@/components/svg/QuestionMark.vue'
import ModalFaq from '@/components/Modals/ModalFaq.vue'
import SwapInterface from '@/components/SwapInterface.vue'

const { fetchMetadata } = useMetadataStore()
const web3Store = useWeb3Store()
const isFaqOpen = ref(false)

tryOnBeforeMount(async () => {
    fetchMetadata()
        .then(() => {
            web3Store.init()
        })
})

const year = computed({
    get: () => {
        return new Date().getFullYear()
    },
    set: () => null
})
</script>

<template>
    <div class="flex flex-col flex-grow">
        <Header
            class="py-2"
        />
        <main class="flex justify-center">
            <SwapInterface/>
        </main>
        <div class="flex justify-center">
            <div class="flex justify-between px-4 py-2 h-16 font-extralight text-xs sm:text-base w-full max-w-sm">
                <div class="flex flex-col">
                    <span>This is a beta version</span>
                    <span class="text-xs">{{ year }} - Swidge</span>
                </div>
                <QuestionMark
                    @click="isFaqOpen = true"
                />
            </div>
        </div>
        <ModalFaq
            :is-open="isFaqOpen"
            @close="isFaqOpen = false"
        />
    </div>
</template>
