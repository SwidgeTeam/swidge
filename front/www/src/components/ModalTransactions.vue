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
import TransactionSplash from './TransactionSplash.vue'
import ProcessingLabel from './ProcessingLabel.vue'
import CompletedLabel from './CompletedLabel.vue'


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
                            <TransactionSplash/>
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
                                    <ProcessingLabel v-if="t.status == 'processing'"/>
                                    <CompletedLabel v-if="t.status =='completed'"/>
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
