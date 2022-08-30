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
        class="header-button"
        @click="emits('click')"
    >
        <span>{{ address }}</span>
    </button>
</template>
