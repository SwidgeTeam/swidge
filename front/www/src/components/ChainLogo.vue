<script setup lang="ts">
defineProps<{
    ChainLogo: string
}>()

</script>

<template>
<img
        style="width: 48px; height: 48px"
        :src="ChainLogo"
        class="rounded-full scale-75 absolute -right-6 -top-6 shadow-lg shadow-black"/>
</template>