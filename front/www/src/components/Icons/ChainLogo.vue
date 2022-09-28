<script setup lang="ts">
const props = defineProps<{
    logo: string
    size: string
}>()
</script>

<template>
    <img
        :style="`width: ${size}px; height: ${size}px; top: -20%; right: -20%`"
        :src="logo"
        class="rounded-full absolute shadow-lg shadow-black"
        alt="chain logo"
    />
</template>
