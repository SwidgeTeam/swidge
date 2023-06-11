<script setup lang='ts'>
import { computed } from 'vue'
import { useMetadataStore } from '@/store/metadata'
import { useTransactionStore } from '@/store/transaction'
import ModalFull from '@/components/Modals/ModalFull.vue'
import Timer from '@/components/Timer.vue'
import { ethers } from 'ethers'
import AmountFormatter from '@/domain/shared/AmountFormatter'
import AssetDisplay from '@/components/Modals/TxStatus/AssetDisplay.vue'
import CopyButton from '@/components/Buttons/CopyButton.vue'
import { PendingTransaction } from '@/domain/transactions/transactions'
import SwidgeLogoWithText from '@/components/Icons/SwidgeLogoWithText.vue'

const metadataStore = useMetadataStore()
const transactionsStore = useTransactionStore()

const props = defineProps<{
    show: boolean
    txId: string
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const transaction = computed({
    get: (): PendingTransaction => {
        return transactionsStore.getTxFromList(props.txId) as PendingTransaction
    },
    set: () => null
})

const crossChainTx = computed({
    get: () => {
        if (!transaction.value) {
            return false
        }
        return transaction.value.fromChain !== transaction.value.toChain
    },
    set: () => null
})

const completed = computed({
    get: () => {
        if (!transaction.value) {
            return false
        }
        return !crossChainTx.value || transaction.value.destinationTxHash !== ''
    },
    set: () => null
})

const srcTokenIcon = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getTokenIcon(transaction.value.fromChain, transaction.value.srcAsset)
    },
    set: () => null
})

const dstTokenIcon = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getTokenIcon(transaction.value.toChain, transaction.value.dstAsset)
    },
    set: () => null
})

const srcChainIcon = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getChainIcon(transaction.value.fromChain)
    },
    set: () => null
})

const dstChainIcon = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getChainIcon(transaction.value.toChain)
    },
    set: () => null
})

const srcChainName = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getChainName(transaction.value.fromChain)
    },
    set: () => null
})

const dstChainName = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getChainName(transaction.value.toChain)
    },
    set: () => null
})

const amountIn = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return formattedAmount(transaction.value.fromChain, transaction.value.srcAsset, transaction.value.amountIn)
    },
    set: () => null
})

const amountOut = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        const amount = formattedAmount(transaction.value.toChain, transaction.value.dstAsset, transaction.value.amountOut)
        return completed.value
            ? amount
            : `~ ${amount}`
    },
    set: () => null
})

const originHash = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return transaction.value.originTxHash
    },
    set: () => null
})

const destinationHash = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return transaction.value.destinationTxHash
    },
    set: () => null
})

const originExplorerUrl = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return metadataStore.getExplorerTxUrl(transaction.value.fromChain, transaction.value.originTxHash)
    },
    set: () => null
})

const destinationExplorerUrl = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return metadataStore.getExplorerTxUrl(transaction.value.toChain, transaction.value.destinationTxHash)
    },
    set: () => null
})

const symbolIn = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getTokenSymbol(transaction.value.fromChain, transaction.value.srcAsset)
    },
    set: () => null
})

const symbolOut = computed({
    get: () => {
        if (!transaction.value) {
            return ''
        }
        return getTokenSymbol(transaction.value.toChain, transaction.value.dstAsset)
    },
    set: () => null
})

/**
 * Returns the chain icon
 * @param chainId
 */
const getChainIcon = (chainId: string): string => {
    const chain = metadataStore.getChain(chainId)
    return chain ? chain.logo : ''
}

/**
 * Returns the chain icon
 * @param chainId
 */
const getChainName = (chainId: string): string => {
    const chain = metadataStore.getChain(chainId)
    return chain ? chain.name : ''
}

/**
 * Returns the token icon
 * @param chainId
 * @param address
 */
const getTokenIcon = (chainId: string, address: string): string => {
    const token = metadataStore.getToken(chainId, address)
    return token ? token.logo : ''
}

/**
 * Returns the token symbol
 * @param chainId
 * @param address
 */
const getTokenSymbol = (chainId: string, address: string): string => {
    const token = metadataStore.getToken(chainId, address)
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
    const token = metadataStore.getToken(chainId, address)
    return token && amount
        ? AmountFormatter.format(ethers.utils.formatUnits(amount, token.decimals).toString())
        : '0'
}

const trimmedTxnHash = (txHash: string) => {
    if (!txHash) {
        return '0x000...000'
    }
    return `${txHash.slice(0, 5)}....${txHash.slice(-3)}`
}
</script>

<template>
    <ModalFull
        :is-open="show"
        @close="emits('close-modal')"
    >

        <div class="absolute flex flex-row w-32 top-2 left-2 cursor-pointer">
            <SwidgeLogoWithText/>
        </div>

        <div class="flex flex-col gap-10 items-center pt-16 xs:pt-0">
            <div class="flex">
                <Timer
                    :seconds="transaction ? Math.round(transaction.expectedTime) : 0"
                    :finished="completed"
                />
            </div>
            <div class="flex">
                <AssetDisplay
                    v-if="!completed"
                    :token-icon="srcTokenIcon"
                    :chain-icon="srcChainIcon"
                    :amount="amountIn"
                    :symbol="symbolIn"
                />
                <div
                    v-if="!completed"
                    class="flex">
                    <img src="../../assets/horizontal-arrow.svg"/>
                </div>
                <AssetDisplay
                    :token-icon="dstTokenIcon"
                    :chain-icon="dstChainIcon"
                    :amount="amountOut"
                    :symbol="symbolOut"
                    :class="{'text-xl': completed}"
                />
            </div>
            <div
                v-if="completed"
                class="text-lg text-green-700">
                Swidge successful
            </div>
            <div class="flex flex-col items-center w-64">
                <div class="flex flex-row items-center gap-1">
                    <span>{{ srcChainName }}:</span>
                    <a class="link" :href="originExplorerUrl">{{ trimmedTxnHash(originHash) }}</a>
                    <CopyButton :content="originHash"/>
                </div>
                <div v-if="crossChainTx" class="flex flex-row items-center gap-1">
                    <span>{{ dstChainName }}:</span>
                    <a
                        v-if="completed"
                        :href="destinationExplorerUrl"
                        class="link">
                        {{ trimmedTxnHash(destinationHash) }}
                    </a>
                    <span
                        v-else
                        class="link blur cursor-default">
                        {{ trimmedTxnHash(destinationHash) }}
                    </span>
                    <CopyButton v-if="completed" :content="destinationHash"/>
                </div>
            </div>
            <div class="flex flex-col w-[60%] items-center text-xs text-gray-500 gap-3">
                <div>
                    <a
                        href="https://twitter.com/therealswidge"
                        target="_blank"
                        class="flex flex-row items-center gap-2">
                        <img src="../../assets/twitter-grey.png" class="w-6 h-6 itmes-center align-center"/>
                        Tweet about your one-click swidge
                    </a>
                </div>
                <div>
                    <a
                        href="https://discord.swidge.app/"
                        target="_blank"
                        class="flex flex-row items-center gap-2">
                        <img src="../../assets/discord-grey.png" class="w-6 h-6 items-center align-center"/>
                        Join our community on Discord
                    </a>
                </div>
            </div>
        </div>
    </ModalFull>
</template>
