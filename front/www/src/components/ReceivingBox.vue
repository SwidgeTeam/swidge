<script setup lang="ts">
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import RouteMother from '../../tests/unit/store/routes.mother'
import { ref } from 'vue'

const emits = defineEmits<{
    (event: 'select-token'): void
}>()

const selectedRoute = ref<number>(0)

const onSelected = (index: number) => {
    selectedRoute.value = index
}
</script>

<template>
    <div class="flex flex-col px-1 pt-2 receiving-box-colors h-full">
        <div class="px-1">
            <span class="pl-2 text-xs text-slate-400 h-[var(--receive-title-height)] ">You receive</span>
            <div class="flex items-center justify-between py-3 h-[var(--receive-selector-height)]">
                <AssetSelector
                    :is-origin="false"
                    @open-token-list="() => emits('select-token')"
                />
            </div>
        </div>
        <div class="routes-container">
            <RoutesCard
                v-for="(route, index) in RouteMother.list()"
                :key="index"
                :route="route"
                :selected-index="selectedRoute"
                @select-route="onSelected"
            />
        </div>
    </div>
</template>
