<script setup lang="ts">
const props = defineProps<{
    logo: string
    size: string
}>()
</script>

<template>
    <img
        :src="logo"
        class="rounded-full absolute shadow-lg shadow-black w-[1rem] md:w-[1.5rem] top-[-20%] right-[-20%]"
        alt="chain logo"
    />
</template>
<!-- :style="`width: ${size}px; height: ${size}px; top: -20%; right: -20%`" -->
