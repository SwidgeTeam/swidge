<script setup lang="ts">
defineProps<{
    text: string
}>()
</script>

<template>
    <div class="relative has-tooltip">
        <span
            class='tooltip rounded-xl shadow-lg px-2 bg-[#31313E] text-white text-xs font-light absolute border border-cyan-700 -bottom-3'>
            {{ text }}
        </span>
        <slot/>
    </div>
</template>
