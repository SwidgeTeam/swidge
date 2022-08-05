<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'
import SwidgeAPI from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { onUpdated, ref } from 'vue'
import { Transaction } from '@/api/models/transactions'
import { Networks } from '@/domain/chains/Networks'
import IToken from '@/domain/tokens/IToken'
import { INetwork } from '@/models/INetwork'
import { ethers } from 'ethers'
import TransactionSplash from './TransactionSplash.vue'
import TransactionStatus from './TransactionStatus.vue'
import { useTokensStore } from '@/store/tokens'

const web3Store = useWeb3Store()
const tokensStore = useTokensStore()

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
    return Networks.get(chainId)
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
const getToken = (chainId: string, address: string): IToken | undefined => {
    return tokensStore.getToken(chainId, address)
}

/**
 * Returns the token name
 * @param chainId
 * @param address
 */
const getTokenName = (chainId: string, address: string): string => {
    const token = getToken(chainId, address)
    return token ? token.name : ''
}

/**
 * Returns the token icon
 * @param chainId
 * @param address
 */
const getTokenIcon = (chainId: string, address: string): string => {
    const token = getToken(chainId, address)
    return token ? token.logo : ''
}

/**
 * Formats an amount of the given token
 * @param chainId
 * @param address
 * @param amount
 */
const formattedAmount = (chainId: string, address: string, amount: string): string => {
    const token = getToken(chainId, address)
    return token
        ? ethers.utils.formatUnits(amount, token.decimals)
        : '0'
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
                            <TransactionStatus
                                v-for="(tx, index) in transactions"
                                :key="index"
                                :date="transformDate(+tx.date)"
                                :status="tx.status"
                                :tokenLogoIn="getTokenIcon(tx.fromChain,tx.srcAsset)"
                                :chainLogoIn="getChainIcon(tx.fromChain)"
                                :tokenLogoOut="getTokenIcon(tx.toChain,tx.dstAsset)"
                                :chainLogoOut="getChainIcon(tx.toChain)"
                                :amountIn="formattedAmount(tx.fromChain, tx.srcAsset, tx.amountIn)"
                                :amountOut="formattedAmount(tx.fromChain, tx.srcAsset, tx.amountIn)"
                                :tokenNameIn="getTokenName(tx.fromChain,tx.srcAsset)"
                                :tokenNameOut="getTokenName(tx.toChain,tx.dstAsset)"
                            />
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
