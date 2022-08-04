<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'
import SwidgeAPI from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { onUpdated, ref } from 'vue'
import { Transaction } from '@/api/models/transactions'
import networks from '@/assets/Networks'
import IToken from '@/tokens/models/IToken'
import { INetwork } from '@/models/INetwork'
import { ethers } from 'ethers'

const web3Store = useWeb3Store()

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: true
    },
})

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const transactions = ref<Transaction[]>([])
const isLoading = ref<boolean>(false)

onUpdated(async () => {
    if (props.isOpen) {
        await loadData()
    }
})

/**
 * Load transactions list
 */
const loadData = async () => {
    isLoading.value = true
    return SwidgeAPI.getTransactions(web3Store.account)
        .then(transactionList => {
            transactions.value = transactionList.transactions
            isLoading.value = false
        })
}

/**
 * Format date
 * @param timestamp
 */
const transformDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDay()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
}

/**
 * Fetches a chain by ID
 * @param chainId
 */
const getNetwork = (chainId: string): INetwork => {
    const network = networks.get(chainId)
    if (!network) {
        throw new Error('Unsupported network')
    }
    return network
}

/**
 * Returns the chain name
 * @param chainId
 */
// const getChainName = (chainId: string): string => {
//     const network = getNetwork(chainId)

//     return network.name
// }

/**
 * Returns the chain icon
 * @param chainId
 */
const getChainIcon = (chainId: string): string => {
    const network = getNetwork(chainId)

    return network.icon
}

/**
 * Gets a token from a specific chain
 * @param chainId
 * @param address
 */
const getToken = (chainId: string, address: string): IToken => {
    const network = getNetwork(chainId)

    return network.tokens.find(token => {
        return token.address === address
    })
}

/**
 * Returns the token name
 * @param chainId
 * @param address
 */
const getTokenName = (chainId: string, address: string): string => {
    const token = getToken(chainId, address)
    return token.name
}

/**
 * Returns the token icon
 * @param chainId
 * @param address
 */
const getTokenIcon = (chainId: string, address: string): string => {
    const token = getToken(chainId, address)
    return token.img
}

/**
 * Formats an amount of the given token
 * @param chainId
 * @param address
 * @param amount
 */
const formattedAmount = (chainId: string, address: string, amount: string) => {
    const token = getToken(chainId, address)
    return ethers.utils.formatUnits(amount, token.decimals)
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
                        class="inline-block w-full max-w-xl px-10 py-12 text-left relative align-middle transition-all transform shadow-xl bg-[#222129] rounded-2xl"
                    >
                        <XIcon
                            class="absolute w-5 top-6 right-6 cursor-pointer"
                            @click="onCloseModal()"
                        />
                        <div v-if="isLoading">
                            <div class="animate-pulse flex space-x-4">
                                <div class="rounded-full bg-slate-700 h-10 w-10"></div>
                                <div class="flex-1 space-y-6 py-1">
                                    <div class="h-2 bg-slate-700 rounded"></div>
                                    <div class="space-y-3">
                                        <div class="grid grid-cols-3 gap-4">
                                            <div class="h-2 bg-slate-700 rounded col-span-2"></div>
                                            <div class="h-2 bg-slate-700 rounded col-span-1"></div>
                                        </div>
                                        <div class="h-2 bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="!isLoading && transactions.length === 0" class="text-center">
                            No transactions
                        </div>
                        <div v-if="!isLoading && transactions.length > 0">
                            <li
                                v-for="t in transactions"
                                :key="t.txHash"
                                class="content-center gradient-border-header-main flex flex-wrap justify-between gap-2 mb-4 p-2">
                                <div class="w-full flex justify-between">
                                    <div class="grid flex justify-start content-center"> {{ transformDate(+t.date) }} </div>
                                    <div v-if="t.status == 'processing'" class="flex justify-end border border-gray-50 px-2 rounded-2xl content-center justify-center items-center gap-1"> {{ t.status }} 
                                    <svg class="grid flex justify-center items-center animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8736 1.28601e-05C18.0818 1.25887e-05 23.1145 5.03271 23.1145 11.2409C23.1145 17.449 18.0818 22.4817 11.8737 22.4817C5.66551 22.4817 0.632812 17.449 0.632812 11.2409C0.632812 5.03271 5.66551 1.31315e-05 11.8736 1.28601e-05ZM11.8737 16.7961C14.9417 16.7961 17.4289 14.3089 17.4289 11.2409C17.4289 8.17277 14.9417 5.68559 11.8736 5.68559C8.80557 5.68559 6.31839 8.17277 6.31839 11.2409C6.31839 14.3089 8.80557 16.7961 11.8737 16.7961Z" fill="#222129"/>
                                    <path d="M11.8736 1.28601e-05C13.9045 1.27713e-05 15.8975 0.55021 17.6407 1.59214C19.3839 2.63407 20.8123 4.12881 21.7741 5.91751C22.7358 7.70622 23.1951 9.72207 23.1029 11.7509C23.0108 13.7796 22.3707 15.7456 21.2508 17.4397L16.5079 14.3044C17.0613 13.4671 17.3776 12.4955 17.4232 11.4929C17.4687 10.4903 17.2418 9.49403 16.7665 8.61004C16.2912 7.72606 15.5853 6.98735 14.7237 6.47243C13.8622 5.9575 12.8773 5.68559 11.8736 5.68559L11.8736 1.28601e-05Z" fill="white"/>
                                    </svg>
                                    </div>
                                    <div v-if="t.status =='completed'" class="flex justify-end border border-green-400 bg-green-400 px-2 rounded-2xl justify-center items-center gap-1"> {{ t.status }} 
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.3558 10.5168V11.3876C20.3546 13.4289 19.6936 15.4151 18.4714 17.05C17.2492 18.6849 15.5312 19.881 13.5737 20.4597C11.6162 21.0385 9.5241 20.969 7.60934 20.2616C5.69457 19.5542 4.05977 18.2468 2.94876 16.5344C1.83774 14.8219 1.31004 12.7962 1.44435 10.7594C1.57866 8.72256 2.36778 6.78371 3.69403 5.23199C5.02028 3.68028 6.8126 2.59886 8.80367 2.149C10.7947 1.69914 12.8779 1.90496 14.7424 2.73575" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M20.3556 4.28278L10.3435 14.932L7.33984 11.7404" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-2 flex flex-wrap justify-between grid-flow-col auto-cols-max w-full mx-16 pt-4">
                                    <div class="w-full grid place-content-center p-2">
                                        <div class="relative scale-100 has-tooltip">
                                            <span class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{getTokenName(t.fromChain,t.srcAsset)}}</span>
                                            <img style="width: 64px; height: 64px" :src="getTokenIcon(t.fromChain,t.srcAsset)" class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"/>
                                            <img style="width: 48px; height: 48px" :src="getChainIcon(t.fromChain)" class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"/>
                                        </div>
                                        <div class="flex justify-center pt-5">{{ formattedAmount(t.fromChain, t.srcAsset, t.amountIn) }}</div>
                                    </div>
                                    <div class="grid place-content-center w-full object-center mb-12">
                                        <svg width="82" height="16" viewBox="0 0 82 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 7C0.447715 7 4.5665e-08 7.44772 0 8C-4.5665e-08 8.55228 0.447715 9 1 9L1 7ZM81.7071 8.70711C82.0976 8.31659 82.0976 7.68342 81.7071 7.2929L75.3431 0.928939C74.9526 0.538415 74.3195 0.538415 73.9289 0.928939C73.5384 1.31946 73.5384 1.95263 73.9289 2.34315L79.5858 8.00001L73.9289 13.6569C73.5384 14.0474 73.5384 14.6806 73.9289 15.0711C74.3195 15.4616 74.9526 15.4616 75.3431 15.0711L81.7071 8.70711ZM1 9L81 9.00001L81 7.00001L1 7L1 9Z" fill="white"/>
                                        </svg>
                                    </div>
                                    <div class="w-full grid place-content-center p-2 relative">
                                        <div class="relative scale-100 has-tooltip">
                                            <span class='tooltip rounded-xl shadow-lg p-1 bg-[#31313E] text-white text-sm font-light absolute border border-cyan-700 -bottom-6 -left-20 px-2'>{{getTokenName(t.toChain,t.dstAsset)}}</span>
                                            <img  style="width: 64px; height: 64px" :src="getTokenIcon(t.toChain,t.dstAsset)" class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"/>
                                            <img  style="width: 48px; height: 48px" :src="getChainIcon(t.toChain)" class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"/>
                                        </div>
                                        <div class="flex justify-center pt-5">{{ formattedAmount(t.fromChain, t.srcAsset, t.amountIn) }}</div>
                                    </div>
                                </div>
                            </li>
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
