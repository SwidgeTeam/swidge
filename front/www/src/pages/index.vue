<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { useTokensStore } from '@/store/tokens'
import { onMounted, ref } from 'vue'
import { ArrowCircleRightIcon, XCircleIcon } from '@heroicons/vue/outline'
import BrigdeSwapInterface from '@/components/BrigdeSwapInterface.vue'
import FAQCard from '@/components/FAQCard.vue'

const { connect } = useWeb3Store()
const { fetchTokens } = useTokensStore()

onMounted(async () => {
    fetchTokens()
    connect(false)
})

const isFaqOpen = ref(false)
</script>

<template>
    <div class="flex gap-[2rem]">
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <span class="text-3xl">Swap & Bridge</span>
                <ArrowCircleRightIcon
                    v-if="!isFaqOpen"
                    class="w-7 h-7 cursor-pointer"
                    @click="isFaqOpen = true"
                />
                <XCircleIcon
                    v-if="isFaqOpen"
                    class="w-7 h-7 cursor-pointer"
                    @click="isFaqOpen = false"
                />
            </div>
            <BrigdeSwapInterface/>
        </div>
        <FAQCard v-if="isFaqOpen"/>
    </div>
</template>

<route lang="yaml">
name : indexPage
meta:
layout: MainLayout
</route>
