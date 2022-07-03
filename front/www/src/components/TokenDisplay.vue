<script setup lang='ts'>
import IToken from '@/tokens/models/IToken'

defineProps<{
  token: IToken
  chainName: string
}>()

</script>

<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2">
      <img
        :src="token.img"
        width="35"
        height="35"
        class="rounded-full overflow-hidden block"
        :alt="token.symbol + '' + 'icon'"
        @error="token.replaceByDefault($event)">
      <span>{{ token.symbol }}</span>
      <span class="font-extralight">{{ token.name }}</span>
    </div>
    <span>{{ chainName }}</span>
  </div>
</template>
