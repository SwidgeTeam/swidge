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
        default: false
    },
})

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const onCloseModal = () => {
    emits('close-modal')
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
        <div class="pl-4 mt-6 text-xl font-light relative sm:flex sm:items-center sm:justify-between">
            <span>Slippage</span>
            <div class="flex pt-2 justify-center">
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
                        ref="ownValue"
                        class="z-0 -top-12 peer w-16 ml-2 mr-1 px-2 h-10 sm:h-12 py-2 text-base sm:text-lg text-center border cursor-pointer rounded-lg border-slate-600 focus:border-slate-600 focus:ring-offset-white focus:ring-gray-300 focus:ring-2 bg-inherit caret-inherit"
                        :class="{ 'border-slate-600 ring-offset-white ring-gray-300 ring-2':isFilled }"
                        type="text"
                        name="slippage"
                        placeholder="Enter"
                        :value="customValue()"
                        @input="onSlippageChange"
                    >
                </div>
            </div>
        </div>
        <div class="mt-8 mb-8">
            <HorizontalLine/>
        </div>
        <div class="pl-4 mt-6 text-xl font-light relative sm:flex sm:items-center sm:justify-between">
            <span class="sm:flex">Gas price</span>
            <div class="flex pt-2 justify-center">
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
