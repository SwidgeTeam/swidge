<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>

<template>
    <div class="flex flex-col flex-grow bg-background-main-dark">
        <Header
            class="py-2 z-[1]"
        />
        <div class="main-container-background"></div>
        <main class="flex items-center justify-center mt-20 z-[1]">
            <router-view/>
        </main>
    </div>
</template>
