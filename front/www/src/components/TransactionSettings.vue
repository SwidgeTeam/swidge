<script setup lang='ts'>
import TransactionSettingsComponent from './TransactionSettingsComponent.vue'

defineProps <{
 slippageValue: string,
 waitingTime: string,
 bridgeFeeValue: string,

}> ()



</script>

<template>
  <div>
    <span class="text-2xl">Transaction Details</span>
    <div class="w-full flex flex-col gap-1.5 mt-3.5">
      <TransactionSettingsComponent
        text="Slippage Tolerance"
        :value = slippageValue />
      <TransactionSettingsComponent
        text="Est. Waiting Time"
        :value= waitingTime />
      <TransactionSettingsComponent
        text="Bridge Fee"
        :value= bridgeFeeValue />
    </div>
    </div>
</template>
