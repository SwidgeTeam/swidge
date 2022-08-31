<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>

<template>
    <div class="flex flex-col flex-grow">
        <Header
            class="py-2 z-[1]"
        />
        <main class="flex z-[1]">
            <router-view/>
        </main>
    </div>
</template>
