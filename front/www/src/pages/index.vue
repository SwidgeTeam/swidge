<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { useTokensStore } from '@/store/tokens'
import { onMounted } from 'vue'
import BrigdeSwapInterfaceVue from '@/components/BrigdeSwapInterface.vue'

const { connect } = useWeb3Store()
const { fetchTokens } = useTokensStore()

onMounted(async () => {
    fetchTokens()
    connect(false)
})
</script>

<template>
    <BrigdeSwapInterfaceVue/>
</template>

<route lang="yaml">
name : indexPage
meta:
    layout: MainLayout
</route>
