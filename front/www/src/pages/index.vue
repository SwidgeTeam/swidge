<script setup lang="ts">
import { useTokensStore } from '@/store/tokens'
import { onMounted } from 'vue'
import { useWeb3Store } from '@/store/web3'
import SwapInterface from '@/components/SwapInterface.vue'

const { fetchTokens } = useTokensStore()
const web3Store = useWeb3Store()

onMounted(async () => {
    fetchTokens()
    web3Store.init()
})
</script>

<template>
    <SwapInterface/>
</template>

<route lang="yaml">
name: indexPage
meta:
layout: MainLayout
</route>
