<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import AddressButton from './Buttons/AddressButton.vue'
import ChainButton from './Buttons/ChainButton.vue'
import SwidgeLogo from './svg/SwidgeLogo.vue'
import ModalNetworks from '@/components/Modals/ModalNetworks.vue'
import { computed, ref } from 'vue'
import ConnectButton from '@/components/Buttons/ConnectButton.vue'
import TransactionsButton from './Buttons/TransactionsButton.vue'
import ModalTransactions from './Modals/ModalTransactions.vue'
import ModalWallets from '@/components/Modals/ModalWallets.vue'
import { Wallet } from '@/domain/wallets/IWallet'
import { useMetadataStore } from '@/store/metadata'
import SwidgeLogoNoText from '@/components/svg/SwidgeLogoNoText.vue'

const web3Store = useWeb3Store()
const metadataStore = useMetadataStore()
const { account, isConnected, isCorrectNetwork, selectedNetworkId } =
    storeToRefs(web3Store)

const isNetworkModalOpen = ref(false)
const isTransactionsModalOpen = ref(false)
const isWalletsModalOpen = ref(false)

const changeNetwork = (chainId: string) => {
    web3Store.switchToNetwork(chainId).then(() => {
        isNetworkModalOpen.value = false
    })
}

const connect = () => {
    isWalletsModalOpen.value = true
}

const setWallet = (wallet: Wallet) => {
    web3Store.init(wallet, true)
}

const handleClickOnAddress = () => {
    web3Store.disconnect()
}

const chainName = computed({
    get: () => {
        if (!selectedNetworkId.value) {
            return ''
        }
        const chain = metadataStore.getChain(selectedNetworkId.value)
        return chain ? chain.name : ''
    },
    set: () => null,
})

const chainIcon = computed({
    get: () => {
        if (!selectedNetworkId.value) {
            return ''
        }
        const chain = metadataStore.getChain(selectedNetworkId.value)
        return chain ? chain.logo : ''
    },
    set: () => null,
})
</script>

<template>
    <nav
        class="flex items-center h-[var(--header-height)] justify-between w-full px-2 bg-transparent md:p-8 md:my-4"
    >
        <div class="flex items-center">
            <a class="w-25 sm:w-40" href="https://www.swidge.xyz/">
                <SwidgeLogoNoText class="sm:hidden h-10" />
                <SwidgeLogo class="hidden sm:inline-block" />
            </a>
            <a href="./ComingSoon" class="mx-4">Dashboard</a>
            <a href="" class="mx-4">Swidge</a>
            <a href="" class="mx-4">Invest</a>
        </div>

        <div
            v-if="isConnected"
            class="flex gap-2 text-sm sm:text-base sm:gap-4"
        >
            <TransactionsButton
                @show-transactions="isTransactionsModalOpen = true"
            />
            <AddressButton :address="account" @click="handleClickOnAddress" />
            <ChainButton
                :chain-name="chainName"
                :icon-link="chainIcon"
                :is-correct-network="isCorrectNetwork"
                @switch-network="isNetworkModalOpen = true"
            />
        </div>
        <div v-else class="flex gap-1 sm:gap-4">
            <ConnectButton @connect="connect" />
        </div>
    </nav>
    <ModalNetworks
        :is-open="isNetworkModalOpen"
        @close-modal="isNetworkModalOpen = false"
        @set-chain="changeNetwork($event)"
    />
    <ModalTransactions
        :is-open="isTransactionsModalOpen"
        @close-modal="isTransactionsModalOpen = false"
    />
    <ModalWallets
        :is-open="isWalletsModalOpen"
        @close-modal="isWalletsModalOpen = false"
        @set-wallet="setWallet"
    />
</template>
