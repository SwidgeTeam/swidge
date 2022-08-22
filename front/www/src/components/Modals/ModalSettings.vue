<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'
import SettingsButtonSlippage from '../Buttons/SettingsButtonSlippage.vue'
import SettingsButtonGas from '../Buttons/SettingsButtonGas.vue'
import { useRoutesStore } from '@/store/routes'
import { ref } from 'vue'

const routesStore = useRoutesStore()

const ownValue = ref<HTMLInputElement | null>(null)

const FIRST_DEFAULT = '1'
const SECOND_DEFAULT = '2'

defineProps({
    isOpen: {
        type: Boolean,
        default: true
    },
})

const emits = defineEmits<{
    (event: 'close-modal'): void
    (event: 'send-update-gas-value', value: string): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const focusInput = () => {
    ownValue.value?.focus()
}

const onChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const value = event.target.value
    routesStore.setSlippage(value)
}

const customValue = () => {
    const selectedValue = routesStore.getSlippage
    if (selectedValue !== FIRST_DEFAULT && selectedValue !== SECOND_DEFAULT) {
        return selectedValue
    }
    return ''
}

const onGasChange = (value) => {
    // Store
}
</script>

<template>
    <Modal
        :is-open="isOpen"
        @close="onCloseModal"
    >
        <div class="absolute top-4 text-3xl font-semibold">
            Settings
        </div>
        <div class="pl-4 mt-6 text-xl font-light relative">
            Slippage
            <div class="absolute -right-1 -top-2 flex">
                <SettingsButtonSlippage
                    :content="FIRST_DEFAULT + '%'"
                    :value="FIRST_DEFAULT"
                    name="slippage"
                />
                <SettingsButtonSlippage
                    :content="SECOND_DEFAULT + '%'"
                    :value="SECOND_DEFAULT"
                    name="slippage"
                />
                <div class="ml-1">
                    <input
                        type="radio"
                        name="slippage"
                        class="z-10 absolute peer w-16 h-12 cursor-pointer mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible focus:ring-white/0 focus:ring-offset-white/0 active:ring-white/0 active:ring-offset-white/0"
                        @click="focusInput">
                    <label
                        class="flex z-10 grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:text-slate-800 peer-checked:font-normal"
                        for="slippage"></label>
                    <input
                        ref="ownValue"
                        class="absolute z-0 -top-12 peer w-16 h-12 ml-2 mr-1 px-2 py-2 text-center border rounded-lg border-slate-600 focus:border-slate-600 focus:ring-offset-white focus:ring-gray-300 focus:ring-2 bg-inherit caret-inherit relative overflow-hidden"
                        type="text"
                        name="slippage"
                        placeholder="Enter"
                        :value="customValue()"
                        @change="onChange"
                    >
                </div>
            </div>
        </div>
        <div class="mt-12 mb-12">
            <svg
                width="495"
                height="1"
                viewBox="0 0 495 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <line
                    x1="-4.37114e-08"
                    y1="0.5"
                    x2="495"
                    y2="0.499957"
                    stroke="#6B6B6B"/>
            </svg>

        </div>
        <div class="pl-4 mt-6 text-xl font-light relative">
            Gas price
            <div class="absolute -right-1 -top-2 grid grid-cols-3 grid-rows-1">
                <SettingsButtonGas
                    content="Slow"
                    input="slow"
                    name="Gas"
                    value="slow"
                    @update-gas-value="onGasChange()"/>
                <SettingsButtonGas
                    content="Medium"
                    input="medium"
                    name="Gas"
                    value="medium"
                    @update-gas-value="emits('send-update-gas-value','medium')"/>
                <SettingsButtonGas
                    content="Fast"
                    input="fast"
                    name="Gas"
                    value="fast"
                    @update-gas-value="emits('send-update-gas-value','fast')"/>
            </div>
        </div>
    </Modal>
</template>
