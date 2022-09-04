<script setup lang="ts">
import Header from '@/components/Header.vue'
import { tryOnBeforeMount } from '@vueuse/core'
import { useTokensStore } from '@/store/tokens'
import { useWeb3Store } from '@/store/web3'

const { fetchMetadata } = useTokensStore()
const web3Store = useWeb3Store()

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
            class="py-2 z-[1]"
        />
        <main class="flex justify-center z-[1]">
            <router-view/>
        </main>
    </div>
</template>
