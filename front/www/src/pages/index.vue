<script setup lang="ts">
import { useTokensStore } from '@/store/tokens'
import { onMounted, ref } from 'vue'
import { ArrowCircleRightIcon, ArrowCircleUpIcon } from '@heroicons/vue/outline'
import BrigdeSwapInterface from '@/components/BrigdeSwapInterface.vue'
import FAQCard from '@/components/FAQCard.vue'
import { useWeb3Store } from '@/store/web3'

const { fetchTokens } = useTokensStore()
const web3Store = useWeb3Store()

onMounted(async () => {
    fetchTokens()
    web3Store.init()
})

const isFaqOpen = ref(false)
</script>

<template>
    <div class="flex flex-col gap-[2rem]">
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <span class="text-3xl">Swap & Bridge</span>
            </div>
            <BrigdeSwapInterface />
            <div class="flex items-center gap-[0.5rem]">
                <ArrowCircleRightIcon
                    v-if="!isFaqOpen"
                    class="w-10 h-10 cursor-pointer"
                    @click="isFaqOpen = true"
                />
                <ArrowCircleUpIcon
                    v-if="isFaqOpen"
                    class="w-10 h-10 cursor-pointer"
                    @click="isFaqOpen = false"
                />
                <span class="text-3xl">FAQ</span>
            </div>
            <BrigdeSwapInterface/>
        </div>
        <FAQCard v-if="isFaqOpen" />
    </div>
</template>

<route lang="yaml">
name: indexPage
meta:
layout: MainLayout
</route>
