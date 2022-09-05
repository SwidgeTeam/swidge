<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import { useTokensStore } from '@/store/tokens'
import { useRoutesStore } from '@/store/routes'
import { ethers } from 'ethers'

const web3Store = useWeb3Store()
const routesStore = useRoutesStore()
const tokensStore = useTokensStore()
const { isConnected } = storeToRefs(web3Store)
const { receiverAddress } = storeToRefs(routesStore)

const getChainLogo = (): string => {
    const chainId = tokensStore.getDestinationChainId
    const chain = tokensStore.getChain(chainId)
    return chain.logo
}

const onAccountChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const value = event.target.value.toLowerCase().trim()
    if (isValidAddress(value)) {
        console.log('valid')
        routesStore.setReceiverAddress(value)
    }
    else {
        // todo
    }
}

const onFocusOut = () => {
    console.log('out')
}

const isValidAddress = (string: string) => {
    try {
        ethers.utils.getAddress(string)
        return true
    } catch (e) {
        // not an address, just a term
        return false
    }
}
</script>

<template>
    <div
        class="flex align-center justify-center h-[var(--recipient-address-height)] px-4 border-[#626060]/40 border rounded-2xl">
        <div v-if="isConnected" class="flex w-full">
            <div v-if="tokensStore.getDestinationChainId" class="self-center">
                <img
                    :src="getChainLogo()"
                    class="rounded-full"
                    width="24"
                    height="24"
                    alt="chain logo"/>
            </div>
            <input
                type="text"
                class="w-full py-3 bg-transparent text-xs sm:text-sm text-center border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
                :value="receiverAddress"
                minlength="1"
                maxlength="79"
                @change="onAccountChange"
                @focusout="onFocusOut"
            />
        </div>
        <span v-else class="py-3 text-xs sm:text-sm">Recipient Address</span>
    </div>
</template>
