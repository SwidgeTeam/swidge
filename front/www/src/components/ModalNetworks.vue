<script setup lang='ts'>
import {Dialog, DialogOverlay, TransitionChild, TransitionRoot} from '@headlessui/vue'
import {XIcon} from '@heroicons/vue/solid'
import networks from '@/assets/Networks'

defineProps<{
  isModalOpen: boolean
}>()

const emits = defineEmits<{
  (event: 'close-modal'): void
  (event: 'set-chain', chain: string): void
}>()

const onCloseModal = () => {
    emits('close-modal')
}

const selectChain = (chain: string) => {
    emits('set-chain', chain)
}

const getNetworks = () => {
    return Array.from(networks.values())
}


</script>

<template>
  <TransitionRoot
    as="template"
    :show="isModalOpen"
  >
    <Dialog
      as="div"
      class="fixed inset-0 z-10 overflow-y-auto"
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
            class="inline-block w-full max-w-xl px-10 py-12 text-left relative align-middle transition-all transform shadow-xl bg-[#222129] rounded-2xl"
          >
            <XIcon
              class="absolute w-5 top-6 right-6 cursor-pointer"
              @click="onCloseModal()"
            />
            <button
              v-for="chain in getNetworks()"
              :key="chain.id"
              class="flex items-center gap-2 tracking-wide network-button"
              @click="selectChain(chain.id)"
            >
              <img :alt="chain.name + ' icon'" :src="chain.icon"/>
              <span>{{ chain.name }}</span>
            </button>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
