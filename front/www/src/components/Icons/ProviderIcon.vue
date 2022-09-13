<script setup lang="ts">
defineProps<{
    name: string
    logo: string
}>()
</script>

<template>
    <div class="relative has-tooltip">
        <span
            class='tooltip rounded-xl shadow-lg px-2 bg-[#31313E] text-white text-xs font-light absolute border border-cyan-700 -bottom-3'>
            {{ name }}
        </span>
        <img
            :src="logo"
            class="relative z-10 w-6 h-6 ml-3 rounded-full bg-white"
            alt="provider logo">
    </div>
</template>
