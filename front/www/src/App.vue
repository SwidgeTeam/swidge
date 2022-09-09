<script setup lang="ts">
import { useHead } from '@vueuse/head'
import MainLayout from './layouts/MainLayout.vue';

useHead({
    title: 'Swidge | Swap-Bridge Interface',
})
</script>

<template>
    <router-view />
</template>
