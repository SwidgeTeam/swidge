<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'
import { Wallet } from '@/domain/wallets/IWallet'

defineProps<{
    isOpen: boolean
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
    (event: 'set-wallet', wallet: Wallet): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const selectWallet = (wallet: Wallet) => {
    emits('set-wallet', wallet)
    emits('close-modal')
}

const getWallets = () => {
    return [
        {
            name: 'Metamask',
            key: Wallet.Metamask,
            icon: 'wallet/metamask.png'
        },
        {
            name: 'WalletConnect',
            key: Wallet.WalletConnect,
            icon: 'wallet/walletconnect.svg'
        },
    ]
}


</script>

<template>
    <Modal
        :is-open="isOpen"
        @close="onCloseModal()"
    >
        <button
            v-for="(wallet, index) in getWallets()"
            :key="index"
            class="network-button"
            @click="selectWallet(wallet.key)"
        >
            <img :alt="wallet.name + ' icon'" :src="wallet.icon"/>
            <span>{{ wallet.name }}</span>
        </button>
    </Modal>
</template>
