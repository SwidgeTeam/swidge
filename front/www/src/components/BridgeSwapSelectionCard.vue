<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { computed } from 'vue'
import { useTokensStore } from '@/store/tokens'
import { Networks } from '@/domain/chains/Networks'

const tokensStore = useTokensStore()

const props = defineProps<{
    value: string
    balance?: string
    disabledInput: boolean
    isOrigin: boolean
}>()

const emits = defineEmits<{
    (event: 'update:value', value: string): void
    (event: 'input-changed'): void
    (event: 'open-token-list'): void
}>()

const onChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    // Filters out all letters of the user input except numbers
    event.target.value = event.target.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1')
        .replace(/^0*(\d)/gm, '$1')

    emits('update:value', event.target.value)
}

const setToMaxAmount = () => {
    if (!props.balance) return
    emits('update:value', props.balance)
    emits('input-changed')
}

const onFallbackImgHandler = (e: Event) => {
    const token = getToken()
    if (token) {
        const chain = Networks.get(token.chainId)
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = chain.icon
    }
}

const trimmedBalance = computed({
    get: () => {
        const number = Number(props.balance)
        if (number === 0) {
            return '0'
        } else {
            return number.toFixed(6)
        }
    },
    set: () => null,
})

const getToken = () => {
    if (props.isOrigin) {
        return tokensStore.getOriginToken()
    } else {
        return tokensStore.getDestinationToken()
    }
}

const getChainName = (): string => {
    const token = getToken()
    return token ? token.chainName : ''
}

const getTokenLogo = (): string => {
    const token = getToken()
    return token ? token.logo : ''
}

const getTokenSymbol = (): string => {
    const token = getToken()
    return token ? token.symbol : ''
}
</script>

<template>
    <div
        class="flex flex-col gap-2 px-4 py-3 items-center gradient-border-selection-main w-[32rem]"
    >
        <div class="flex flex-row">
            <div class="flex">
                <div class="flex items-center w-full gap-2 text-xl">
                    <div
                        class="flex justify-between gap-2 cursor-pointer bg-[#222129]/40 px-2 py-1 rounded-2xl hover:bg-[#222129]/100 transition duration-150 ease-out hover:ease-in"
                        @click="emits('open-token-list')">
                        <div
                            v-if="getToken()"
                            class="flex flex-col text-sm font-extralight"
                        >
                            <span>{{ getChainName() }}</span>
                            <div class="flex items-center w-full gap-2 text-xl">
                                <div class="flex gap-2 items-center">
                                    <img
                                        :src="getTokenLogo()"
                                        class="rounded-full"
                                        width="24"
                                        height="24"
                                        @error="onFallbackImgHandler"
                                    />
                                    <span class="flex py-2 min-w-[rem]">
                                        {{
                                            getTokenSymbol()
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex flex-align-center text-md font-light py-4 w-120">Select token</div>

                        <div
                            v-if="getToken()"
                            class="items-center gap-2 text-xl">
                            <ChevronDownIcon class="h-6"/>
                        </div>
                        <div
                            v-else
                            class="flex items-center gap-2 text-xl">
                            <ChevronDownIcon class="h-6"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex">
                <input
                    type="text"
                    :disabled="disabledInput"
                    :value="value"
                    placeholder="0.0"
                    class="w-full p-0 text-2xl text-right bg-transparent border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
                    autocomplete="off"
                    minlength="1"
                    maxlength="79"
                    inputmode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    @change="emits('input-changed')"
                    @input="onChange"
                />
            </div>
        </div>
        <div
            v-if="isOrigin && getToken()"
            class="flex flex-row w-full">
            <div class="flex gap-2 w-full">
                <div class="font-extralight text-sm">
                    Balance: {{ trimmedBalance }}
                </div>
                <button
                    class="px-2 text-[14px] font-roboto bg-[#B22F7F] rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22F7F]"
                    @click="setToMaxAmount"
                >
                    MAX
                </button>
            </div>
            <div class="w-full text-right">
                <!-- TODO $$ value -->
            </div>
        </div>
    </div>
</template>
