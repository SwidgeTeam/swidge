<script setup lang='ts'>
import { LinkIcon } from '@heroicons/vue/outline';

const emits = defineEmits<{
    (event: 'show-transactions'): void
}>()

</script>

<template>
    <button
        class="flex items-center gap-2 tracking-wide header-button"
        @click="emits('show-transactions')"
    >
        <LinkIcon class="h-5"/>
        <span>Transactions</span>
    </button>
</template>