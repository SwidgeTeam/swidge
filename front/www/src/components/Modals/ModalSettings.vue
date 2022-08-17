<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'


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
            <div class="absolute -right-1 -top-2 ">
                <button class="w-16 h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800 focus:font-semibold">1%</button>
                <button class="w-16 h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800  focus:font-semibold">2%</button>
                <input 
                    class="w-16 h-12 ml-2 mr-1 px-2 py-2 text-center border rounded-lg border-slate-600 bg-inherit caret-inherit relative" 
                    type="text"
                    placeholder="Enter"
                    >
                    
            </div>
        </div>
        <div  class="mt-12 mb-12">
            <svg width="495" height="1" viewBox="0 0 495 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="-4.37114e-08" y1="0.5" x2="495" y2="0.499957" stroke="#6B6B6B"/>
            </svg>

        </div>
        <div  class="pl-4 mt-6 text-xl font-light relative">
            Gas price
            <div class="absolute -right-1 -top-2">
                <button class="h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800 focus:font-semibold">Slow</button>
                <button class="h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800  focus:font-semibold">Medium</button>
                <button class="h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800  focus:font-semibold">Fast</button>
            </div>
        </div>
    </Modal>
</template>
