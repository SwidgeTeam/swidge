<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import AddressButton from './Buttons/AddressButton.vue'
import ChainButton from './Buttons/ChainButton.vue'
import SwidgeLogo from './svg/SwidgeLogo.vue'
import ModalNetworks from '@/components/ModalNetworks.vue'
import { computed, ref } from 'vue'
import ConnectButton from '@/components/Buttons/ConnectButton.vue'
import { Networks } from '@/domain/chains/Networks'
import TransactionsButton from './Buttons/TransactionsButton.vue'
import ModalTransactions from './Modals/ModalTransactions.vue'
import ModalWallets from '@/components/Modals/ModalWallets.vue'
import { Wallet } from '@/domain/wallets/IWallet';

const emits = defineEmits<{
    (event: 'switch-network', chainId: string): void
}>()

const web3Store = useWeb3Store()
const { account, isConnected, isCorrectNetwork, selectedNetworkId } = storeToRefs(web3Store)

const isNetworkModalOpen = ref(false)
const isTransactionsModalOpen = ref(false)
const isWalletsModalOpen = ref(false)

const createShortAddress = (address: string): string => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4)
}

const changeNetwork = (chainId: string) => {
    web3Store.switchToNetwork(chainId)
        .then(() => {
            isNetworkModalOpen.value = false
            emits('switch-network', chainId)
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
        const chain = Networks.get(selectedNetworkId.value)
        return chain.name
    },
    set: () => null
})

const chainIcon = computed({
    get: () => {
        if (!selectedNetworkId.value) {
            return ''
        }
        const chain = Networks.get(selectedNetworkId.value)
        return chain.icon
    },
    set: () => null
})
</script>

<template>
    <nav class="flex items-center justify-between w-full px-24 z-[1]">
        <a class="flex items-center justify-center w-40" href="https://www.swidge.xyz/">
            <SwidgeLogo/>
        </a>
        <div v-if="isConnected" class="flex gap-4 font-extralight">
            <ChainButton
                :chain-name="chainName"
                :icon-link="chainIcon"
                :is-correct-network="isCorrectNetwork"
                @switch-network="isNetworkModalOpen = true"
            />
            <AddressButton
                :address="createShortAddress(account)"
                @click="handleClickOnAddress"
            />
            <TransactionsButton
                @show-transactions="isTransactionsModalOpen = true"/>
        </div>
        <div v-else class="flex gap-4 font-extralight">
            <ConnectButton
                @connect="connect"
            />
        </div>
    </nav>
    <ModalNetworks
        :is-network-modal-open="isNetworkModalOpen"
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

