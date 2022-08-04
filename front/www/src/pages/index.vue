<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { useTokensStore } from '@/store/tokens'
import { onMounted } from 'vue'
import BrigdeSwapInterfaceVue from '@/components/BrigdeSwapInterface.vue'
import FAQCard from '@/components/FAQCard.vue'

const { connect } = useWeb3Store()
const { fetchTokens } = useTokensStore()

onMounted(async () => {
    fetchTokens()
    connect(false)
})
</script>

<template>
    <div class="flex gap-[2rem]">
        <BrigdeSwapInterfaceVue/>
        <FAQCard v-if="false"/>
    </div>
</template>

<route lang="yaml">
name : indexPage
meta:
layout: MainLayout
</route>
