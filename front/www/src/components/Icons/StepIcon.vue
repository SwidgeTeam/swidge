<script setup lang="ts">

defineProps<{
    icon: string
}>()
</script>

<template>
    <img :src="icon" class="h-5 w-5 sm:h-6 sm:w-6 rounded-full mx-1 xs:mx-2">
</template>
