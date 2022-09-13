<script setup lang='ts'>
import StatusStep from '../StatusStep.vue'
import { useRoutesStore } from '@/store/routes'
import Route from '@/domain/paths/path'
import Modal from '@/components/Modals/Modal.vue'

const routesStore = useRoutesStore()

defineProps<{
    show: boolean
}>()

const emits = defineEmits<{
    (event: 'close-modal'): void
}>()

const getRoute = (): Route => {
    return routesStore.getSelectedRoute
}

</script>

<template>
    <Modal
        :is-open="show"
        @close="emits('close-modal')">

        <StatusStep
            v-for="(step, index) in getRoute().steps"
            :key="index"
            :step="step"
        />

        <div v-if="getRoute().completed" class="flex flex-col items-center">
            <div class="text-3xl font-bold">Swidge successful!</div>
        </div>
    </Modal>
</template>
