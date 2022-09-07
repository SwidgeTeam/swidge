<script setup lang="ts">
import { ref } from 'vue'
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import { useRoutesStore } from '@/store/routes'

const routesStore = useRoutesStore()

const emits = defineEmits<{
    (event: 'select-token'): void
}>()

const expandedRoutes = ref<boolean>(false)

const onSelected = (index: number) => {
    routesStore.selectRoute(index)
}

const selectedIndex = () => {
    return routesStore.getSelectedIndex
}

const routes = () => {
    return expandedRoutes.value
        ? routesStore.getAllRoutes
        : routesStore.getPromotedRoutes
}

const thereAreRoutes = () => {
    return routesStore.getAllRoutes.length > 0
}

const thereAreMoreRoutes = () => {
    return routesStore.getAllRoutes.length > routesStore.getPromotedRoutes.length
}
</script>

<template>
    <div class="flex flex-col px-1 pt-2 receiving-box-colors h-full relative">
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
                :selected-index="selectedIndex()"
                @select-route="onSelected"
            />
            <div v-if="thereAreMoreRoutes()" class="flex justify-center">
                <button
                    class="text-sm border rounded-lg border-[#54545F] bg-[#2F283A]/100 px-1"
                    @click="expandedRoutes = !expandedRoutes"
                >
                    <span v-if="expandedRoutes">Less routes</span>
                    <span v-else>More routes</span>
                </button>
            </div>
        </div>
    </div>
</template>
