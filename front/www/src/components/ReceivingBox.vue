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

const onSelected = (index: string) => {
    routesStore.selectRoute(index)
}

const selectedId = () => {
    return routesStore.getSelectedId
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
    <div class="flex flex-col px-1 pb-2 receiving-box-colors relative">
        <div class="px-1">
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
                :selected-id="selectedId()"
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
