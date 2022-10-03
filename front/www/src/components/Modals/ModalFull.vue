<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'


defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
})

const emits = defineEmits<{
    (event: 'close'): void
}>()

const onCloseModal = () => {
    emits('close')
}
</script>

<template>
    <TransitionRoot
        as="template"
        :show="isOpen"
    >
        <Dialog
            as="div"
            class="fixed inset-0 z-10 overflow-y-auto"
            @close="onCloseModal()"
        >
            <div class="flex justify-center min-h-screen text-center block p-0 h-full w-full">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 transition-opacity bg-opacity-90"/>
                </TransitionChild>
                <span
                    class="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true">&#8203;</span>
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div
                        class="inline-block w-full h-full sm:py-12 xs:py-12 text-left 
                        relative transition-all transform shadow-xl 
                        bg-[#222129] background-gradient-transaction-modal"
                    >
                        <XIcon
                            class="absolute w-5 top-2 right-2 sm:top-6 sm:right-6 cursor-pointer"
                            @click="onCloseModal()"
                        />
                        <slot/>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
