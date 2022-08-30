<script setup lang='ts'>
import { LinkIcon } from '@heroicons/vue/outline';

const emits = defineEmits<{
    (event: 'connect'): void
}>()

</script>

<template>
    <button
        class="header-button"
        @click="emits('connect')"
    >
        <LinkIcon class="h-5"/>
        <span>Connect</span>
    </button>
</template>
