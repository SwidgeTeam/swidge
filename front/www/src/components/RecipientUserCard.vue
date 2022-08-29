<script setup lang="ts">
import { useWeb3Store } from '@/store/web3'
import { storeToRefs } from 'pinia'
import { useTokensStore } from '@/store/tokens'
import { Networks } from '@/domain/chains/Networks'
import { ref } from 'vue';

const web3Store = useWeb3Store()
const { account, isConnected, isCorrectNetwork, selectedNetworkId } =
    storeToRefs(web3Store)
console.log(account, isConnected, isCorrectNetwork, selectedNetworkId)

const tokensStore = useTokensStore()

const props = defineProps<{
    disabledInput: boolean
}>()

const isExpanded = ref(false);

const toggleLable = () => {
    return isExpanded.value ? 'show less' : 'show more'
}
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

const createShortAddress = (address: string, visibleAddress:number): string => {
    return address.substring(0, visibleAddress) + '...'
}

</script>

<template>
    <div
        class="flex flex-col gap-2 px-4 py-3 items-center border-[#626060]/40 border rounded-2xl w-[32rem]"
    >
        <div class="flex justify-between w-full">
            <div class=" font-light flex flex-85 w-full">
                <div v-if="isConnected" class="flex gap-2 flex-wrap w-full ">
                <img v-if="tokensStore.getDestinationToken()"
                    :src="getTokenLogo()"
                    class="rounded-full"
                    width="24"
                    height="24"
                    @error="onFallbackImgHandler"
                />
                <!-- <span class="" v-if="isExpanded">{{account}}</span> -->
               <input
               v-if="isExpanded"
                    type="text"
                    :disabled="disabledInput"
                    :placeholder=account
                    class="w-full p-0 text-left text-white placeholder-white bg-transparent border-none outline-none appearance-none focus:border-transparent focus:ring-0"
                    autocomplete="off"
                    minlength="1"
                    maxlength="79"
                />
                <span v-else>{{ createShortAddress(account, 3) }}</span>
                 
                <button class="underline flex-none flex-nowrap" @click="isExpanded = !isExpanded">{{toggleLable()}}</button>
                </div>
                <span v-else>Recipient Address</span>
            </div>
            <div class="flex flex-15">User.user</div>
        </div>
    </div>
</template>
