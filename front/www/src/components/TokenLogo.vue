<script setup lang="ts">
defineProps<{
    TokenLogo: string
}>()

</script>

<template>
<img
         style="width: 64px; height: 64px"
         :src="TokenLogo"
        class="rounded-full scale-125 object-center relative bot-0 top-0 shadow-lg shadow-black"/>
</template>