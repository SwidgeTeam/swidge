<script setup lang='ts'>
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/outline'

import StatusStep from './StatusStep.vue'
import { computed } from 'vue'
import { useRoutesStore } from '@/store/routes'
import Route from '@/domain/paths/path'
import { Networks } from '@/domain/chains/Networks'

const routesStore = useRoutesStore()

defineProps<{
    show: boolean
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const successMessage = computed({
    get: () => {
        const route = routesStore.getSelectedRoute
        const tokenIn = route.resume.tokenIn.name
        const tokenOut = route.resume.tokenOut.name
        const amountIn = route.resume.amountIn
        const amountOut = route.resume.amountOut
        const fromChainName = Networks.get(route.resume.fromChain).name
        const toChainName = Networks.get(route.resume.toChain).name

        return 'You’ve successfully transferred ' + Number(amountIn).toFixed(2) + ' ' + tokenIn + ' on ' + fromChainName +
            ' to ' + Number(amountOut).toFixed(2) + ' ' + tokenOut + ' on ' + toChainName
    },
    set: () => null
})

const getRoute = (): Route => {
    return routesStore.getSelectedRoute
}

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
                            v-for="(step, index) in getRoute().steps"
                            :key="index"
                            :step="step"
                        />

                        <div v-if="getRoute().completed" class="flex flex-col items-center">
                            <div class="text-3xl font-extrabold">Swidge successful!</div>
                            <div class="mt-6">{{ successMessage }}</div>
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
