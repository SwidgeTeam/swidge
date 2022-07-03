<script setup lang='ts'>
import TransactionSettingsComponent from './TransactionSettingsComponent.vue'
</script>

<template>
  <div>
    <span class="text-2xl">Transaction Settings:</span>
    <div class="w-full flex flex-col gap-1.5 mt-3.5">
      <TransactionSettingsComponent
        text="Slippage Tolerance"
        value="3.00%" />
      <TransactionSettingsComponent
        text="Native Token"
        value="1.00% = 1.43 MATIC" />
      <TransactionSettingsComponent
        text="Bridge Fee"
        value="USDC 0.25" />
    </div>
  </div>
</template>
