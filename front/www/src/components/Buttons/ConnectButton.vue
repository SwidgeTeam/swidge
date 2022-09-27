<script setup lang='ts'>
import { LinkIcon } from '@heroicons/vue/outline'

const emits = defineEmits<{
    (event: 'connect'): void
}>()

</script>

<template>
    <button
        class="flex
        items-center
        gap-2
        tracking-wide
        px-3 py-1
        font-roboto
        font-light
        gradient-border-header-main
        hover:gradient-border-header-main-hover"
        @click="emits('connect')"
    >
        <LinkIcon class="h-5"/>
        <span>Connect</span>
    </button>
</template>
