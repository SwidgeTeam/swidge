<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'
import SettingsButtonSlippage from '../Buttons/SettingsButtonSlippage.vue'
import SettingsButtonGas from '../Buttons/SettingsButtonGas.vue'
import { ref } from 'vue'

const ownValue = ref<HTMLInputElement | null>(null)

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
                <SettingsButtonSlippage content="1%" input="1" name="slippage" value="1" attr=""/>
                <SettingsButtonSlippage content="2%" input="2" name="slippage" value="2" attr="checked"/>
                <div class="ml-1">
                    <input @click="focusInput" type="radio" name="slippage" class="z-10 absolute peer w-16 h-12 cursor-pointer mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible focus:ring-white/0 focus:ring-offset-white/0 active:ring-white/0 active:ring-offset-white/0">
                    <label class="flex z-10 grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:text-slate-800 peer-checked:font-normal" for={{input}}></label>
                    <input 
                        class="absulute z-0 -top-12 peer w-16 h-12 ml-2 mr-1 px-2 py-2 text-center border rounded-lg border-slate-600 focus:border-slate-600 focus:ring-offset-white focus:ring-gray-300 focus:ring-2 bg-inherit caret-inherit relative overflow-hidden" 
                        type="text"
                        name="slippage"
                        ref="ownValue"
                        placeholder="Enter"
                        >
                </div>
            </div>
        </div>
        <div  class="mt-12 mb-12">
            <svg width="495" height="1" viewBox="0 0 495 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="-4.37114e-08" y1="0.5" x2="495" y2="0.499957" stroke="#6B6B6B"/>
            </svg>

        </div>
        <div  class="pl-4 mt-6 text-xl font-light relative">
            Gas price
            <div class="absolute -right-1 -top-2 grid grid-cols-3 grid-rows-1">
                <SettingsButtonGas content="Slow" input="Slow" name="Gas" value="slow"/>
                <SettingsButtonGas content="Medium" input="Medium" name="Gas" value="medium" />
                <SettingsButtonGas content="Fast" input="Fast" name="Gas" value="fast" />
            </div>
        </div>
    </Modal>
</template>
