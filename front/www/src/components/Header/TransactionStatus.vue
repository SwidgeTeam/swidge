<script setup lang="ts">
import { useMetadataStore } from '@/store/metadata'
import { CheckIcon } from '@heroicons/vue/outline'
import TransactionStatusDetails from './TransactionStatusDetails.vue'
import { TransactionStatus } from '@/api/models/get-status-check'
import BridgeStepArrow from '../svg/BridgeStepArrow.vue'
import StatusLoading from '../svg/StatusLoading.vue'
import { Transaction } from '@/domain/transactions/transactions'
import { IToken } from '@/domain/metadata/Metadata'
import { ethers } from 'ethers'

const metadataStore = useMetadataStore()

const props = defineProps<{
    transaction: Transaction
}>()

/**
 * Format date
 */
const transformDate = () => {
    const date = new Date(props.transaction.date)
    const year = date.getUTCFullYear()
    const month = padTo2Digits(date.getUTCMonth() + 1)
    const day = padTo2Digits(date.getUTCDate())
    const hours = padTo2Digits(date.getUTCHours())
    const minutes = padTo2Digits(date.getUTCMinutes())
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
}

/**
 * Format digits inside date
 * @param num
 */
function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0')
}

/**
 * returns the tx url
 * @param chainId
 * @param txHash
 */
const getExplorerTxUrl = (chainId: string, txHash: string): string => {
    const url = metadataStore.getExplorerTxUrl(chainId, txHash)
    return url ? url : ''
}

/**
 * Gets a token from a specific chain
 * @param chainId
 * @param address
 */
const getToken = (chainId: string, address: string): IToken | undefined => {
    return metadataStore.getToken(chainId, address)
}

/**
 * Returns the token name
 * @param chainId
 * @param address
 */
const getTokenSymbol = (chainId: string, address: string): string => {
    const token = getToken(chainId, address)
    return token ? token.symbol : ''
}

/**
 * Formats an amount of the given token
 * @param chainId
 * @param address
 * @param amount
 */
const formattedAmount = (
    chainId: string,
    address: string,
    amount: string
): string => {
    const token = getToken(chainId, address)
    return token && amount
        ? ethers.utils.formatUnits(amount, token.decimals)
        : '0'
}

/**
 * Returns the chain icon
 * @param chainId
 */
const getChainIcon = (chainId: string): string => {
    const chain = metadataStore.getChain(chainId)
    return chain ? chain.logo : ''
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
</script>

<template>
    <div class="gradient-border-header-main p-2 mb-2">
        <div class="flex items-center justify-between mb-4">
            <div class="font-light text-xs">{{ transformDate() }}</div>
            <div
                class="h-4 w-4 rounded-full flex items-center justify-center p-[1px]"
                :class="{'bg-[#1CBA3E]': transaction.status === TransactionStatus.Success}"
            >
                <CheckIcon
                    v-if="transaction.status === TransactionStatus.Success"
                    class="h-4 w-4 font-extrabold stroke-[4px]"/>
                <StatusLoading
                    v-if="transaction.status === TransactionStatus.Pending"
                    class="font-extrabold stroke-[4px] fill-[#B22F7F] fill-cyan-500"/>
            </div>
        </div>
        <div class="flex">
            <TransactionStatusDetails
                :amount="formattedAmount(transaction.fromChain, transaction.srcAsset, transaction.amountIn)"
                :token-symbol="getTokenSymbol(transaction.fromChain, transaction.srcAsset)"
                :token-logo="getTokenIcon(transaction.fromChain, transaction.srcAsset)"
                :chain-logo="getChainIcon(transaction.fromChain)"
                :tx-hash="transaction.originTxHash"
                :explorer-tx-url="getExplorerTxUrl(transaction.fromChain, transaction.originTxHash)"
            />
            <div class="flex items-center justify-center mb-7 w-full">
                <BridgeStepArrow class="h-[2rem] w-[1rem]"/>
            </div>
            <TransactionStatusDetails
                :amount="formattedAmount(transaction.toChain, transaction.dstAsset, transaction.amountOut)"
                :token-symbol="getTokenSymbol(transaction.toChain, transaction.dstAsset)"
                :token-logo="getTokenIcon(transaction.toChain, transaction.dstAsset)"
                :chain-logo="getChainIcon(transaction.toChain)"
                :tx-hash="transaction.destinationTxHash"
                :explorer-tx-url="getExplorerTxUrl(transaction.toChain, transaction.destinationTxHash)"
            />
        </div>
    </div>
</template>
