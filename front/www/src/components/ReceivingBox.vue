<script setup lang="ts">
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import RouteMother from '../../tests/unit/store/routes.mother'

const emits = defineEmits<{
    (event: 'select-token'): void
}>()
const route = () => {
    return RouteMother.default()
}
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
            <RoutesCard
                :route="route()"
                :unique="1"
            />
        </div>
    </div>
</template>
