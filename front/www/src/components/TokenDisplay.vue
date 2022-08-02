<script setup lang='ts'>
import ITokenN from '@/domain/tokens/ITokenN'

defineProps<{
  token: ITokenN
}>()

</script>

<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2">
      <img
        :src="token.logo"
        width="35"
        height="35"
        class="rounded-full overflow-hidden block"
        :alt="token.symbol + '' + 'icon'">
      <span>{{ token.symbol }}</span>
      <span class="font-extralight">{{ token.name }}</span>
    </div>
    <span>{{ token.chainName }}</span>
  </div>
</template>
