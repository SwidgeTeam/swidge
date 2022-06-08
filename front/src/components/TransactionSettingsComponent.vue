<script setup lang='ts'>
defineProps<{
  text: string,
  value: string
}>()
</script>
 
<template>
  <div class="flex justify-between items-center w-full font-extralight">
    <span>{{ text }}</span>
    <span>{{ value }}</span>
  </div>
</template>