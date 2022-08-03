<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/outline'

import StatusStep from './StatusStep.vue'
import { TransactionSteps } from '@/models/TransactionSteps'
import { computed } from 'vue'
import IToken from '@/domain/tokens/IToken'

const props = defineProps<{
    show: boolean
    steps: TransactionSteps,
    sourceToken: IToken,
    destinationToken: IToken
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const successMessage = computed({
    get: () => {
        const amountIn = props.steps.origin.amountIn
        const tokenIn = props.steps.origin.tokenIn
        let amountOut, tokenOut
        if (props.sourceToken.chainName === props.destinationToken.chainName) {
            amountOut = props.steps.origin.amountOut
            tokenOut = props.steps.origin.tokenOut
        } else {
            amountOut = props.steps.destination.amountOut
            tokenOut = props.steps.destination.tokenOut
        }
        return 'You’ve successfully transferred ' + Number(amountIn).toFixed(2) + ' ' + tokenIn + ' on ' + props.sourceToken.chainName +
            ' to ' + Number(amountOut).toFixed(2) + ' ' + tokenOut + ' on ' + props.destinationToken.chainName
    },
    set: () => null
})

</script>

<template>
    <TransitionRoot as="template" :show="show">
        <Dialog
            as="div"
            class="fixed inset-0 z-10 overflow-y-auto"
            @close="emits('close-modal')"
        >
            <div
                class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
            >
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
                    <DialogOverlay
                        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    />
                </TransitionChild>
                <span
                    class="inline-block h-screen align-middle"
                    aria-hidden="true">&#8203;
          </span>
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div
                        class="inline-block w-full max-w-2xl px-16 pt-8 pb-16 text-left align-middle transition-all transform shadow-xl bg-[#222129] rounded-2xl"
                    >
                        <div class="flex flex-row-reverse">
                            <button @click="emits('close-modal')">
                                <XIcon class="h-6"/>
                            </button>
                        </div>

                        <StatusStep
                            v-if="steps.origin.required"
                            title="Swap on ZeroEx"
                            :amount-in="steps.origin.amountIn"
                            :amount-out="steps.origin.amountOut"
                            :token-in="steps.origin.tokenIn"
                            :token-out="steps.origin.tokenOut"
                            :completed="steps.origin.completed"
                        />

                        <StatusStep
                            v-if="steps.bridge.required"
                            title="Transfer via Multichain"
                            :amount-in="steps.bridge.amountIn"
                            :amount-out="steps.bridge.amountOut"
                            :token-in="steps.bridge.tokenIn"
                            :token-out="steps.bridge.tokenOut"
                            :completed="steps.bridge.completed"
                        />

                        <StatusStep
                            v-if="steps.destination.required"
                            title="Swap on ZeroEx"
                            :amount-in="steps.destination.amountIn"
                            :amount-out="steps.destination.amountOut"
                            :token-in="steps.destination.tokenIn"
                            :token-out="steps.destination.tokenOut"
                            :completed="steps.destination.completed"
                        />

                        <div v-if="steps.completed" class="flex flex-col items-center">
                            <div class="text-3xl font-extrabold">Swidge successful!</div>
                            <div class="mt-6">{{successMessage}}</div>
                            <div class="mt-3">
                                <button
                                    class="w-full py-3 rounded-xl flex items-center justify-center"
                                    @click="emits('close-modal')">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
