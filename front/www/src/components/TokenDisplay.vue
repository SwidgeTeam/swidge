<script setup lang='ts'>
import IToken from '@/domain/tokens/IToken'

defineProps<{
  token: IToken
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
