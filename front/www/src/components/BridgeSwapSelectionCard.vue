<script setup lang='ts'>
import IToken from '@/tokens/models/IToken'
import { ChevronDownIcon } from '@heroicons/vue/outline'
import { INetwork } from '@/models/INetwork'
import { computed } from 'vue';

const props = defineProps<{
    value: number
    balance?: string
    token?: IToken
    chainInfo?: INetwork
    disabledInput: boolean
}>()

const emits = defineEmits<{
    (event: 'update:value', value: number): void
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
    emits('update:value', Number(event.target.value))
}

const setToMaxAmount = () => {
    if (!props.balance) return
    emits('update:value', Number(props.balance))
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
        class="
            flex flex-col
            gap-2
            px-6
            py-4
            gradient-border-selection-main
            w-[32rem]
        "
    >
        <div class="flex justify-between w-full">
            <div
                class="flex items-center gap-2 cursor-pointer font-extralight"
                @click="emits('open-token-list')"
            >
                <img
                    v-if="chainInfo && chainInfo.icon !== ''"
                    :src="chainInfo.icon"
                    class="rounded-full"
                    width="24"
                    height="24"
                />
                <div>
                    {{
                        chainInfo && chainInfo.name !== ''
                            ? `${chainInfo.name}:`
                            : 'Select Network'
                    }}
                </div>
            </div>
            <div v-if="balance && token && chainInfo" class="font-extralight">
                Balance: {{ trimmedBalance }}
            </div>
        </div>
        <div class="flex w-full gap-8">
            <div class="flex items-center w-full gap-2 text-xl cursor-pointer">
                <div
                    class="flex gap-2 items-center"
                    @click="emits('open-token-list')"
                >
                    <img
                        v-if="token && token.img !== ''"
                        :src="token.img"
                        width="32"
                        class="rounded-full"
                        height="32"
                        @error="onFallbackImgHandler"
                    />
                    <span class="min-w-[rem]">{{
                        token ? token.symbol : 'Select Token'
                    }}</span>
                    <ChevronDownIcon class="h-6" />
                </div>
                <button
                    v-if="balance && token && chainInfo"
                    class="
                        px-2
                        text-[14px]
                        font-roboto
                        bg-[#B22F7F]
                        rounded-2xl
                        text-center
                        focus:outline-none
                        focus:ring-2
                        focus:ring-offset-2
                        focus:ring-[#B22F7F]
                    "
                    @click="setToMaxAmount"
                >
                    MAX
                </button>
            </div>
            <div>
                <input
                    type="text"
                    :disabled="disabledInput"
                    :value="value > 0 ? value : ''"
                    placeholder="0.0"
                    class="
                        w-40
                        p-0
                        text-2xl text-right
                        bg-transparent
                        border-none
                        outline-none
                        appearance-none
                        focus:border-transparent focus:ring-0
                        truncate
                    "
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
    </div>
</template>
