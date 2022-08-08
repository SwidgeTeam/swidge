<script setup lang="ts">
defineProps<{
    chainLogo: string
}>()

</script>

<template>
    <img
        style="width: 48px; height: 48px"
        :src="chainLogo"
        class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"
        alt="chain logo"
    />
</template>
