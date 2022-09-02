<script setup lang="ts">
defineProps<{
    logo: string
    size: string
}>()
</script>

<template>
    <img
        :style="`width: ${size}px; height: ${size}px`"
        :src="logo"
        class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"
        alt="token logo"
    />
</template>
