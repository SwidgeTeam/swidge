<script setup lang='ts'>
import { ref } from 'vue'
import Modal from '@/components/Modals/Modal.vue'

defineProps<{
    isOpen: boolean
}>()

const emits = defineEmits<{
    (event: 'close'): void
    (event: 'import-token'): void
}>()

const isUnderstood = ref<boolean>(false)

const toggleUnderstood = () => {
    isUnderstood.value = !isUnderstood.value
}

const accept = () => {
    emits('close')
    emits('import-token')
}
</script>

<template>
    <Modal
        :is-open="isOpen"
        @close="() => emits('close')"
    >
        <div class="flex flex-col font-roboto">
            <div class="text-lg mb-3">Import token</div>
            <hr/>
            <div class="mt-3 mb-3">
                <p>
                    Anyone can create a token with any name, including creating fake versions of existing
                    tokens and tokens that claim to represent projects that do not have a token.
                </p>
                <br>
                <p>
                    If you purchase an arbitrary token, you may be unable to sell it back.
                </p>
            </div>
            <hr/>
            <div class="flex mt-3">
                <div>
                    <input type="checkbox" @click="toggleUnderstood">
                    It's understood
                </div>
                <button
                    class="flex items-center gap-2 tracking-wide header-button ml-auto"
                    :disabled="!isUnderstood"
                    @click="accept">
                    Import
                </button>
            </div>
        </div>
    </Modal>
</template>
