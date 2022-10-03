<script setup lang="ts">
import { tryOnBeforeMount } from '@vueuse/core'
import { useMetadataStore } from '@/store/metadata'
import { useWeb3Store } from '@/store/web3'
import Header from '@/components/Header/Header.vue'
import { useTransactionStore } from '@/store/transaction'

const { fetchMetadata } = useMetadataStore()
const web3Store = useWeb3Store()
const transactionStore = useTransactionStore()

tryOnBeforeMount(async () => {
    fetchMetadata()
        .then(() => {
            web3Store.init()
        })
    transactionStore.startRetryingSendingPendingTxs()
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
