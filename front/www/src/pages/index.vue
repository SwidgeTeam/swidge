<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { onMounted } from 'vue'
import BrigdeSwapInterfaceVue from '@/components/BrigdeSwapInterface.vue'

const { connect } = useWeb3Store()

onMounted(async () => {
    await connect(false)
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
