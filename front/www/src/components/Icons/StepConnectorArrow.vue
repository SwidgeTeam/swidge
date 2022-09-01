<script setup lang="ts">
import BridgeStepArrow from '../svg/BridgeStepArrow.vue'
import SwapStepArrow from '../svg/SwapStepArrow.vue'

defineProps<{
    stepType: string
}>()
</script>

<template>
    <SwapStepArrow v-if="stepType === 'swap'"/>
    <BridgeStepArrow v-else/>
</template>
