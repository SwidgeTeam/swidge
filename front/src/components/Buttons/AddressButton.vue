<script setup lang='ts'>
defineProps<{
  address: string
}>()
</script>
 
<template>
  <div class="header-button">
    <template v-if="address.length > 0">
      <span>{{ address }}</span>
    </template>
    <template v-if="address.length < 1">
      <span>Not connected</span>
    </template>
  </div>
</template>