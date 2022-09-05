<script setup lang="ts">
import { ref } from 'vue'
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import { useRoutesStore } from '@/store/routes'

const routesStore = useRoutesStore()

const emits = defineEmits<{
    (event: 'select-token'): void
}>()

const selectedRoute = ref<number>(0)

const onSelected = (index: number) => {
    routesStore.selectRoute(index)
}

const routes = () => {
    return routesStore.getAllRoutes
}

const thereAreRoutes = () => {
    return routesStore.getAllRoutes.length > 0
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
        <div v-if="thereAreRoutes()" class="routes-container">
            <RoutesCard
                v-for="(route, index) in routes()"
                :key="index"
                :route="route"
                :selected-index="selectedRoute"
                @select-route="onSelected"
            />
        </div>
    </div>
</template>
