<script setup lang="ts">
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import RouteMother from '../../tests/unit/store/routes.mother'

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
        <div class="flex flex-col py-3 gap-2 border-t border-[#34313D]">
            <RoutesCard
                v-for="(route, index) in RouteMother.list()"
                :key="index"
                :route="route"
                :selected-index="0"
            />
        </div>
    </div>
</template>
