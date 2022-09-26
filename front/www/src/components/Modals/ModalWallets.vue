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
                    <DialogOverlay class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"/>
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
                        class="flex flex-col sm:inline-block sm:align-middle sm:justify-center items-center w-full max-w-md px-6 py-8 sm:px-24
                     sm:py-12 text-left relative transition-all transform shadow-xl 
                     bg-[#222129] radial-gradient rounded-2xl"
                    > 
                    <XIcon
                            class="absolute w-5 top-2 right-2 sm:top-6 sm:right-6 cursor-pointer"
                            @click="onCloseModal()"
                        />
                    <h1 class="absolute w-5 top-3 left-6 sm:top-6 sm:right-6 cursor-pointer font-semibold font-roboto text-xl">Connect</h1>
                    <button
                        v-for="(wallet, index) in getWallets()"
                        :key="index"
                        class="items-center tracking-wide px-10 py-5 align-center
        font-roboto font-semibold gradient-border-header-main hover:gradient-border-header-main-hover          
        inline-block m-5"
                        @click="selectWallet(wallet.key)"
                    >
                        <img 
                            class="w-32 h-32"
                            :alt="wallet.name + ' icon'"
                            :src="wallet.icon"/>
                        <span>{{ wallet.name }}</span>
                    </button>
                                          
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
    
</template>
