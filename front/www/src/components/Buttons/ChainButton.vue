<script setup lang='ts'>

defineProps<{
  chainName: string,
  iconLink: string,
  isNetwork: boolean
}>()

const emits = defineEmits<{
  (event: 'switch-network'): void
}>()

</script>

<template>
  <template v-if="isNetwork">
    <button
      class="flex items-center gap-2 tracking-wide header-button"
      @click="emits('switch-network')"
    >
        <img
            class="chain-icon"
            :alt="chainName + ' icon'"
            :src="iconLink"
        />
      <span>{{ chainName }}</span>
    </button>
  </template>
  <template v-if="!isNetwork">
    <button
      class="flex items-center gap-2 tracking-wide header-button"
      @click="emits('switch-network')"
    >
      <span>Wrong Network</span>
    </button>
  </template>
</template>
