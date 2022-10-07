<script setup lang='ts'>
import { computed } from 'vue'
import { useMetadataStore } from '@/store/metadata'
import { useTransactionStore } from '@/store/transaction'
import ModalFull from '@/components/Modals/ModalFull.vue'
import SwidgeLogo from '../svg/SwidgeLogo.vue'
import Timer from '@/components/Timer.vue'
import TokenLogo from '@/components/Icons/TokenLogo.vue'
import ChainLogo from '@/components/Icons/ChainLogo.vue'

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
    get: () => {
        return transactionsStore.getTxFromList(props.txId)
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
    const token = metadataStore.getToken(chainId, address)
    return token ? token.logo : ''
}
</script>

<template>
    <ModalFull
        :is-open="show"
        @close="emits('close-modal')">

        <SwidgeLogo class="absolute w-32 top-2 left-2 cursor-pointer"/>

        <div class="flex flex-col">
            <div class="flex justify-center">
                <Timer :seconds="200"/>
            </div>
            <div class="flex justify-center">
                <div class="relative">
                    <TokenLogo
                        :token-logo="srcTokenIcon"
                        :chain-logo="srcChainIcon"
                        size="22"
                    />
                    <ChainLogo :logo="srcChainIcon" size="14"/>
                </div>
                <div>
                    arrow
                </div>
                <div class="relative">
                    <TokenLogo
                        :token-logo="dstTokenIcon"
                        :chain-logo="dstChainIcon"
                        size="22"
                    />
                    <ChainLogo :logo="dstChainIcon" size="14"/>
                </div>
            </div>
            <div class="flex justify-center">
                <div>Start Chain Hash</div>
                <div>Dest. Chain Hash</div>
            </div>
            <div class="flex justify-center">
                <div>Twitter</div>
                <div>Discord</div>
            </div>
        </div>

        <div class="text-3xl font-bold">Swidge successful!</div>
    </ModalFull>
</template>
