<script setup lang="ts">
import Toolip from '@/components/Toolip.vue'

defineProps<{
    name: string
    logo: string
}>()
</script>

<template>
    <Toolip :text="name">
        <img
            :src="logo"
            class="relative w-6 h-6 rounded-full bg-white"
            alt="provider logo">
    </Toolip>
</template>
