<script setup lang="ts">
    import { useWeb3Store } from '@/store/web3'
    import { storeToRefs } from 'pinia'
    import { useTokensStore } from '@/store/tokens'
    import { useRoutesStore } from '@/store/routes'
    import { Networks } from '@/domain/chains/Networks'
    
    const web3Store = useWeb3Store()
    const routesStore = useRoutesStore()
    const { account, isConnected} = storeToRefs(web3Store)
    const { receiverAddress } = storeToRefs(routesStore)
    routesStore.setReceiverAddress(account.value)
    
    const tokensStore = useTokensStore()
    
    const props = defineProps<{
        disabledInput: boolean
    }>()
    
    const getTokenLogo = (): string => {
        const token = tokensStore.getDestinationToken()
        return token ? token.logo : ''
    }
    
    const onFallbackImgHandler = (e: Event) => {
        const token = tokensStore.getDestinationToken()
        if (token) {
            const chain = Networks.get(token.chainId)
            const imageTarget = e.target as HTMLImageElement
            imageTarget.src = chain.icon
        }
    }
    
    const onAccountChange = (event: Event) => {
        if (!(event.target instanceof HTMLInputElement)) return
        const value = event.target.value
        routesStore.setReceiverAddress(value)
    }
    
</script>

<template>
    <div class="flex align-center justify-center px-4  border-[#626060]/40 border rounded-2xl w-[32rem]">
        <div v-if="isConnected" class="flex w-full">
            <div class="self-center" v-if="tokensStore.getDestinationToken()">
                <img 
                    :src="getTokenLogo()"
                    class="rounded-full"
                    width="24"
                    height="24"
                    @error="onFallbackImgHandler"
                />
            </div>
            <input
                type="text"
                class="w-full py-3 bg-transparent text-center border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
                :value=receiverAddress
                minlength="1"
                maxlength="79"
                @change=onAccountChange
            />
        </div>
        <span v-else class="py-3">Recipient Address</span>
    </div>
</template>
