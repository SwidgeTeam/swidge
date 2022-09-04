<script setup lang='ts'>
import Modal from '@/components/Modals/Modal.vue'
import { useTokensStore } from '@/store/tokens'

const metadataStore = useTokensStore()

defineProps<{
    isOpen: boolean
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
    return metadataStore.getChains
}
</script>

<template>
    <Modal
        :show="isOpen"
        @close="onCloseModal()"
    >
        <div class="grid grid-cols-1 sm:grid-cols-2">
            <div
                v-for="chain in getNetworks()"
                :key="chain.id"
                class="w-full px-2 py-1"
            >
                <button
                    class="tracking-wide w-full
                     px-3 py-1
                     font-roboto font-light
                     gradient-border-header-main
                     hover:gradient-border-header-main-hover"
                    @click="selectChain(chain.id)"
                >
                    <span class="flex items-center gap-8">
                        <img
                            class="rounded-[100px] w-10"
                            :src="chain.logo"
                            :alt="chain.name + ' icon'"
                        />
                        <span>{{ chain.name }}</span>
                    </span>
                </button>
            </div>
        </div>
    </Modal>
</template>
