<script setup lang='ts'>
import LoadingCircle from '../svg/LoadingCircle.vue'

defineProps<{
  text: string
  disabled: boolean
  isLoading: boolean
  onClick: () => void
}>()
</script>

<template>
  <button
    class="w-full py-3 mt-2 rounded-xl gradient-main flex items-center justify-center text-3xl"
    :class="[(disabled || isLoading) && 'opacity-50 pointer-events-none']"
    @click="onClick()">
    <span>{{ text }}</span>
    <LoadingCircle
      v-if="isLoading"
      class="h-9 w-9"
    />
  </button>
</template>
