<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '@/store/web3'
import { useMetadataStore } from '@/store/metadata'
import { useRoutesStore } from '@/store/routes'
import RedCross from '@/components/svg/RedCross.vue'
import Address from '@/domain/shared/address'

const web3Store = useWeb3Store()
const routesStore = useRoutesStore()
const metadataStore = useMetadataStore()
const { isConnected } = storeToRefs(web3Store)
const { receiverAddress } = storeToRefs(routesStore)
const isFocused = ref<boolean>(false)
const inputReceiverAddress = ref<any | null>(null)

const getChainLogo = (): string => {
    const chainId = routesStore.getDestinationChainId
    const chain = metadataStore.getChain(chainId)
    return chain.logo
}

const onAccountChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const value = event.target.value.toLowerCase().trim()
    routesStore.setReceiverAddress(value)
}

const onFocusIn = () => {
    isFocused.value = true
    setTimeout(() => {
        inputReceiverAddress.value.focus()
    }, 0)
}

const onFocusOut = () => {
    if (routesStore.isValidReceiverAddress) {
        isFocused.value = false
    } else {
        onFocusIn()
    }
}

const onInputFocus = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    event.target.select()
}

const address = () => {
    return new Address(receiverAddress.value).shortFormat()
}
</script>

<template>
    <div
        v-if="isConnected"
        class="flex w-full align-center justify-center h-[var(--recipient-address-height)] px-4 border-[#626060]/40 border rounded-xl">
        <div class="self-center">
            <RedCross v-if="!routesStore.isValidReceiverAddress" class="h-5 w-6"/>
            <img
                v-else-if="routesStore.getDestinationChainId"
                :src="getChainLogo()"
                class="rounded-full h-5 w-6"
                alt="chain logo"/>
        </div>
        <input
            ref="inputReceiverAddress"
            type="text"
            class="w-full py-3 bg-transparent text-xs sm:text-sm text-center border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
            :class="{'hidden' : !isFocused}"
            :value="receiverAddress"
            minlength="1"
            maxlength="79"
            @change="onAccountChange"
            @focusout="onFocusOut"
            @focusin="onInputFocus"
        />
        <button
            class="w-full flex justify-between text-xs sm:text-sm py-2 px-3"
            :class="{'hidden' : isFocused}"
            @click="onFocusIn()"
        >
            <span class="text-slate-300">Receiver address</span>
            <span>{{ address() }}</span>
        </button>
    </div>
</template>
