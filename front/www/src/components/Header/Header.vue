<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import SwidgeLogo from '../svg/SwidgeLogo.vue'
import ConnectButton from '@/components/Buttons/ConnectButton.vue'
import ModalWallets from '@/components/Modals/ModalWallets.vue'
import { Wallet } from '@/domain/wallets/IWallet'
import SwidgeLogoNoText from '@/components/svg/SwidgeLogoNoText.vue'
import Account from '@/components/Header/Account.vue'

const web3Store = useWeb3Store()
const { isConnected } = storeToRefs(web3Store)

const isWalletsModalOpen = ref(false)

const connect = () => {
    isWalletsModalOpen.value = true
}

const setWallet = (wallet: Wallet) => {
    web3Store.init(wallet, true)
}
</script>

<template>
    <nav class="flex items-center h-[var(--header-height)] justify-between w-full px-2 bg-transparent">
        <a class="w-25 sm:w-40" href="https://www.swidge.xyz/">
            <SwidgeLogoNoText class="sm:hidden h-10"/>
            <SwidgeLogo class="hidden sm:inline-block"/>
        </a>
        <div v-if="isConnected" class="flex gap-2 text-sm sm:text-base sm:gap-4">
            <Account/>
        </div>
        <div v-else class="flex gap-1 sm:gap-4">
            <ConnectButton
                @connect="connect"
            />
        </div>
    </nav>
    <ModalWallets
        :is-open="isWalletsModalOpen"
        @close-modal="isWalletsModalOpen = false"
        @set-wallet="setWallet"
    />
</template>

