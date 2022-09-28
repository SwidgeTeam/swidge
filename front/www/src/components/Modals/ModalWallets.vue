<script setup lang='ts'>

import { Wallet } from '@/domain/wallets/IWallet'
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'

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
    <TransitionRoot
        as="template"
        :show="isOpen"
    >
        <Dialog
            as="div"
            class="fixed inset-0 z-10 overflow-y-auto"
            @close="onCloseModal()"
        >
            <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 transition-opacity bg-[#222129] bg-opacity-90"/>
                </TransitionChild>
                <span
                    class="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true">&#8203;</span>
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"> 
                    <div
                        class="flex sm:inline-block self-center align-center justify-self-auto 
                        justify-center w-fit w-50 sm:max-w-md px-8 py-4 sm:px-2
                     sm:py-4 text-left relative transition-all transform shadow-xl 
                     bg-[#222129] radial-gradient rounded-2xl gradient-border-header-main-hover"
                    > 
                    <XIcon
                            class="absolute w-5 top-3 right-3 sm:top-4 sm:right-6 cursor-pointer"
                            @click="onCloseModal()"
                        />
                    <h1 class="absolute w-5 mb- top-3 left-6 sm:top-4 sm:left-6 cursor-pointer font-semibold font-roboto text-xl">Connect</h1>
                    <div class="flex flex-col sm:flex-row py-4 px-2 justify-center">
                        
                        <button
                            v-for="(wallet, index) in getWallets()"
                            :key="index"
                            class="inline-block align-center items-center justify-center w-fit px-3 py-2 m-5 font-roboto font-semibold 
                             hover:gradient-border-header-main-hover-wallet"
                            @click="selectWallet(wallet.key)"
                        >
                            <img 
                                class ="max-w-sm object-contain w-32 h-24"
                                :alt="wallet.name + ' icon'"
                                :src="wallet.icon"/>
                            <span>{{ wallet.name }}</span>
                        </button>
                        
                    </div>                     
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
    
</template>
