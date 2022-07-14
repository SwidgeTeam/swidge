<script setup lang="ts">
import IToken from '@/tokens/models/IToken'
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { INetwork } from '@/models/INetwork'
import { computed } from 'vue'

const props = defineProps<{
    value: string
    balance?: string
    token?: IToken
    chainInfo?: INetwork
    disabledInput: boolean
}>()

const emits = defineEmits<{
    (event: 'update:value', value: string): void
    (event: 'on-click-max-amount'): void
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
    emits('on-click-max-amount')
}

const onFallbackImgHandler = (event: Event) => {
    if (props.token) props.token.replaceByDefault(event)
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
</script>

<template>
    <div
        class="flex gap-2 px-6 py-4 items-center gradient-border-selection-main w-[32rem]"
    >
        <div class="flex flex-col flex-auto w-full">
            <div class="flex items-center w-full gap-2 text-xl">
                <div
                    class="flex justify-between gap-2 cursor-pointer bg-[#222129]/40 px-4 py-2 rounded-2xl hover:bg-[#222129]/100 transition duration-150 ease-out hover:ease-in"
                    @click="emits('open-token-list')"
                >
                    <div class="flex flex-col">
                        <div>
                            <div class="font-extralight">
                                <!-- <img
                            v-if="chainInfo && chainInfo.icon !== ''"
                            :src="chainInfo.icon"
                            class="rounded-full"
                            width="24"
                            height="24"
                                /> -->
                                <!-- <div>
                            {{
                                chainInfo && chainInfo.name !== ''
                                    ? `${chainInfo.name}:`
                                    : 'Select Network'
                            }}
                                </div> -->
                                <div
                                    class="text-sm"                                    
                                    v-if="chainInfo && chainInfo.name !== ''"
                                >   
                                    {{ chainInfo.name }}:
                                <div class="flex items-center w-full gap-2 text-xl">
                                    <div class="flex gap-2 items-center">
                                        <img
                                            v-if="token && token.img !== ''"
                                            :src="token.img"
                                            width="32"                                    
                                            class="rounded-full"
                                            height="32"
                                            @error="onFallbackImgHandler"
                                         />
                                        <span class="flex py-2 min-w-[rem]">{{
                                            token ? token.symbol : 'Select Token'
                                        }}</span>
                                    </div>
                            </div>
                                </div>
                                <div v-else class="flex flex-align-center w-30 select-network-button">Select Network</div>
                            </div>
                        </div>
                        
                    </div>

                    <div class="flex items-center gap-2 text-xl">
                        <ChevronDownIcon class="h-6" />
                    </div>
                </div>
            </div>
            <div class="flex gap-2 pt-2">
                <div
                    v-if="balance && token && chainInfo"
                    class="font-extralight text-sm"
                >
                    Balance: {{ trimmedBalance }}
                </div>
                <div v-else class="font-extralight px-6 text-sm hidden">
                    Balance: {{ trimmedBalance }}
                </div>
                <button
                    v-if="balance && token && chainInfo"
                    @click="setToMaxAmount"
                    class="px-2 text-[14px] font-roboto bg-[#B22F7F] rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22F7F]"
                >
                    MAX
                </button>
            </div>
        </div>

        <div>
            <input
                type="text"
                :disabled="disabledInput"
                :value="value"
                placeholder="0.0"
                class="w-40 p-0 text-2xl text-right bg-transparent border-none outline-none appearance-none focus:border-transparent focus:ring-0 truncate"
                autocomplete="off"
                autocorrect="off"
                minlength="1"
                maxlength="79"
                inputmode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                @change="emits('input-changed')"
                @input="onChange"
            />
        </div>
    </div>
</template>
