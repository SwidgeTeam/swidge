<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'
import SettingsButtonSlippage from '../Buttons/SettingsButtonSlippage.vue'
import SettingsButtonGas from '../Buttons/SettingsButtonGas.vue'
import { useRoutesStore } from '@/store/routes'
import { ref } from 'vue'
import HorizontalLine from '../svg/HorizontalLine.vue'

const routesStore = useRoutesStore()

const ownValue = ref<HTMLInputElement | null>(null)

const FIRST_DEFAULT_SLIPPAGE = '1'
const SECOND_DEFAULT_SLIPPAGE = '2'

const FIRST_DEFAULT_GAS = 'slow'
const SECOND_DEFAULT_GAS = 'medium'
const THIRD_DEFAULT_GAS = 'fast'

const isFilled = ref(false)

defineProps({
    isOpen: {
        type: Boolean,
        default: true
    },
})

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const focusInput = () => {
    ownValue.value?.focus()
}

const onSlippageChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const value = event.target.value
    routesStore.setSlippage(value)
}

const customValue = () => {
    const selectedValue = routesStore.getSlippage
    if (selectedValue !== FIRST_DEFAULT_SLIPPAGE && selectedValue !== SECOND_DEFAULT_SLIPPAGE) {
        isFilled.value = true
        return selectedValue
    }
    isFilled.value = false
    return ''
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
                    :content="FIRST_DEFAULT_SLIPPAGE + '%'"
                    :value="FIRST_DEFAULT_SLIPPAGE"
                    name="slippage"
                />
                <SettingsButtonSlippage
                    :content="SECOND_DEFAULT_SLIPPAGE + '%'"
                    :value="SECOND_DEFAULT_SLIPPAGE"
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
                        :class="{ 'border-slate-600':isFilled,'ring-offset-white':isFilled,'ring-gray-300':isFilled, 'ring-2':isFilled }"
                        type="text"
                        name="slippage"
                        placeholder="Enter"
                        :value="customValue()"
                        @change="onSlippageChange"
                    >
                </div>
            </div>
        </div>
        <div class="mt-12 mb-12">
            <HorizontalLine/>
        </div>
        <div class="pl-4 mt-6 text-xl font-light relative">
            Gas price
            <div class="absolute -right-1 -top-2 grid grid-cols-3 grid-rows-1">
                <SettingsButtonGas
                    :content="FIRST_DEFAULT_GAS"
                    :value="FIRST_DEFAULT_GAS"
                    name="Gas"
                    />
                <SettingsButtonGas
                    :content="SECOND_DEFAULT_GAS"
                    :value="SECOND_DEFAULT_GAS"
                    name="Gas"
                    />
                <SettingsButtonGas
                    :content="THIRD_DEFAULT_GAS"
                    :value="THIRD_DEFAULT_GAS"
                    name="Gas"
                    />
            </div>
        </div>
    </Modal>
</template>
