<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Accordion from '../Accordion.vue'
import { XIcon } from '@heroicons/vue/solid'

const faqTexts = [
    {
        header: "What's happening here?",
        text: 'This is a Swap + Bridge (=Swidge) aggregator that allows you to swidge (see what we did there?) any asset you like on any chain to any other asset on any other chain. Enjoy!'
    },
    {
        header: 'Does Swidge charge fees?',
        text: "We currently don't charge fees. The only fees you need to pay are gas fees (for transactions), swap fees (fees for swapping tokens if needed) and bridge fees (fee paid to bridging provider). We calculate an estimate for you before the transaction is executed."
    },
    {
        header: 'Looking for a specific token?',
        text: "We support any assets that are available to us through the DEXs we have integrated with. You can search them via their name or contract address. If you are looking to trade a token we don't support yet, join our Discord and let us know."
    },
]

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
            class="fixed inset-0 z-10"
            @close="onCloseModal()"
        >
            <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"/>
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
                        class="absolute -bottom-4 max-w-2xl md:max-w-xl left-1/2 -translate-x-1/2 w-full max-h-screen px-10 py-8 overflow-y-auto bg-[#222129] rounded-2xl"
                    >
                        <XIcon
                            class="absolute w-5 top-3 right-3 cursor-pointer"
                            @click="onCloseModal()"
                        />
                        <ul class="flex flex-col gap-5">
                            <Accordion
                                v-for="faq in faqTexts"
                                :key="faq.header"
                                :header="faq.header"
                                :text="faq.text"/>
                        </ul>
                    </div>

                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
