<script setup lang='ts'>
import SwidgeAPI from '@/api/swidge-api'
import { useWeb3Store } from '@/store/web3'
import { onUpdated, ref } from 'vue'
import { Transaction } from '@/api/models/transactions'
import { Networks } from '@/domain/chains/Networks'
import IToken from '@/domain/tokens/IToken'
import { INetwork } from '@/domain/chains/INetwork'
import { ethers } from 'ethers'
import TransactionSplash from '../TransactionSplash.vue'
import TransactionStatus from '../TransactionStatus.vue'
import { useTokensStore } from '@/store/tokens'
import Modal from '@/components/Modals/Modal.vue'

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
 * Format digits inside date
 * @param num
 */
function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0')
}

/**
 * Format date
 * @param timestamp
 */
const transformDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const year = date.getUTCFullYear()
    const month = padTo2Digits(date.getUTCMonth()+1)
    const day = padTo2Digits(date.getUTCDate())
    const hours = padTo2Digits(date.getUTCHours())
    const minutes = padTo2Digits(date.getUTCMinutes())
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
    return token && amount
        ? ethers.utils.formatUnits(amount, token.decimals)
        : '0'
}

</script>

<template>
    <Modal
        :is-open="isOpen"
        @close="onCloseModal"
    >
        <div v-if="isLoading">
            <TransactionSplash/>
        </div>
        <div v-if="!isLoading && transactions.length === 0" class="text-center">
            No transactions
        </div>
        <div v-else>
            <TransactionStatus
                v-for="(tx, index) in transactions"
                :key="index"
                :date="transformDate(tx.date)"
                :status="tx.status"
                :token-logo-in="getTokenIcon(tx.fromChain,tx.srcAsset)"
                :token-logo-out="getTokenIcon(tx.toChain,tx.dstAsset)"
                :chain-logo-in="getChainIcon(tx.fromChain)"
                :chain-logo-out="getChainIcon(tx.toChain)"
                :amount-in="formattedAmount(tx.fromChain, tx.srcAsset, tx.amountIn)"
                :amount-out="formattedAmount(tx.toChain, tx.dstAsset, tx.amountOut)"
                :token-name-in="getTokenName(tx.fromChain,tx.srcAsset)"
                :token-name-out="getTokenName(tx.toChain,tx.dstAsset)"
            />
        </div>
    </Modal>
</template>
