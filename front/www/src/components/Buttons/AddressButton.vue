<script setup lang='ts'>
defineProps<{
    address: string
}>()

const emits = defineEmits<{
    (event: 'click'): void
}>()

</script>

<template>
    <button
        class="flex items-center gap-2 tracking-wide header-button"
        @click="emits('click')"
    >
        <span>{{ address }}</span>
    </button>
</template>
