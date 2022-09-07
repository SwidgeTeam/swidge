<script setup lang="ts">
import { ref } from 'vue'
import { tryOnBeforeMount } from '@vueuse/core'
import { useMetadataStore } from '@/store/metadata'
import { useWeb3Store } from '@/store/web3'
import Header from '@/components/Header.vue'
import QuestionMark from '@/components/svg/QuestionMark.vue'
import ModalFaq from '@/components/Modals/ModalFaq.vue'

const { fetchMetadata } = useMetadataStore()
const web3Store = useWeb3Store()
const isFaqOpen = ref(false)

tryOnBeforeMount(async () => {
    fetchMetadata()
        .then(() => {
            web3Store.init()
        })
})
</script>

<template>
    <div class="flex flex-col flex-grow">
        <Header
            class="py-2"
        />
        <main class="flex justify-center">
            <router-view/>
        </main>
        <div class="flex justify-center">
            <div class="flex justify-between px-4 py-2 h-16 font-extralight text-xs sm:text-base w-full max-w-md">
                <div class="flex flex-col">
                    <span>This is a beta version</span>
                    <span>Swidge™</span>
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
