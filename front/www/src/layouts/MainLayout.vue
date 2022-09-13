<script setup lang="ts">
import { tryOnBeforeMount } from '@vueuse/core'
import { useMetadataStore } from '@/store/metadata'
import { useWeb3Store } from '@/store/web3'
import Header from '@/components/Header.vue'

const { fetchMetadata } = useMetadataStore()
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
            class="py-2"
        />
        <main class="flex justify-center">
            <router-view />
        </main>
    </div>
</template>
