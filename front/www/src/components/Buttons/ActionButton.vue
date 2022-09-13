<script setup lang='ts'>
defineProps<{
  text: string
  disabled: boolean
  onClick: () => void
}>()
</script>

<template>
  <button
    class="w-full py-3 h-15 rounded-xl gradient-main flex items-center justify-center text-3xl"
    :class="[(disabled) && 'opacity-50 pointer-events-none']"
    @click="onClick()">
    <span>{{ text }}</span>
  </button>
</template>
