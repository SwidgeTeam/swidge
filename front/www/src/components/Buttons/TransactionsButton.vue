<script setup lang='ts'>
import BookIcon from '@/components/svg/BookIcon.vue'

const emits = defineEmits<{
    (event: 'show-transactions'): void
}>()

</script>

<template>
    <button
        class="header-button"
        @click="emits('show-transactions')"
    >
        <BookIcon class="h-5"/>
        <span class="inline-block sm:hidden">Txs</span>
        <span class="hidden sm:block">Transactions</span>
    </button>
</template>
