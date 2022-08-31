<script setup lang="ts">
import AssetSelector from '@/components/Buttons/AssetSelector.vue'

const emits = defineEmits<{
    (event: 'select-token'): void
}>()
</script>

<template>
    <div class="receiving-box">
        <span class="text-xs text-slate-400">You receive</span>
        <div class="flex items-center justify-between py-3">
            <AssetSelector
                :is-origin="false"
                @open-token-list="() => emits('select-token')"
            />
        </div>
        <div class="flex pt-3 border-t border-[#34313D]">
            <div class="route-card">
                <div class="route-details flex items-center justify-around">
                    <div class="flex">total</div>
                    <div class="flex">time</div>
                    <div class="flex">fees</div>
                </div>
                <div class="route-steps flex flex-row">
                    <div class=""></div>
                    <div class=""></div>
                </div>
            </div>
        </div>
    </div>
</template>
