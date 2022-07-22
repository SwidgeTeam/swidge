<script setup lang='ts'>
import TransactionSettingsComponent from './TransactionSettingsComponent.vue'

defineProps <{
 slippageValue: string,
 nativeValue: string,
 bridgeFeeValue: string,

}> ()



</script>

<template>
  <div>
    <span class="text-2xl">Available Route:</span>
    <div class="w-full flex flex-col gap-1.5 mt-3.5">
      <TransactionSettingsComponent
        text="Slippage Tolerance"
        :value = slippageValue />
      <TransactionSettingsComponent
        text="Native Token"
        :value= nativeValue />
      <TransactionSettingsComponent
        text="Bridge Fee"
        :value= bridgeFeeValue />
    </div>
    </div>
</template>
