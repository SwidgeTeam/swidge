<script setup lang="ts">
import { ref } from 'vue'
import { useRoutesStore } from '@/store/routes'
import AssetSelector from '@/components/Buttons/AssetSelector.vue'
import RoutesCard from '@/components/RoutesCard.vue'
import LoadingCircle from '@/components/svg/LoadingCircle.vue'

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

const showContainer = () => {
    return thereAreRoutes() || (routesStore.showContainer && !loadingRoutes())
}

const loadingRoutes = () => {
    return routesStore.loadingRoutes
}

const thereAreRoutes = () => {
    return routesStore.getAllRoutes.length > 0
}

const thereAreMoreRoutes = () => {
    return (
        routesStore.getAllRoutes.length > routesStore.getPromotedRoutes.length
    )
}
</script>

<template>
    <div
        class="flex flex-col px-1 receiving-box-colors relative md:h-[123px] md:p-4 md:justify-center"
    >
        <div class="px-1">
            <div
                class="flex items-center justify-between py-3 h-[var(--receive-selector-height)]"
            >
                <AssetSelector
                    :is-origin="false"
                    @open-token-list="() => emits('select-token')"
                />
                <div
                    v-if="!thereAreRoutes() && !loadingRoutes()"
                    class="flex items-center text-slate-300 md:text-xl"
                >
                    0.00
                </div>
                <div
                    v-if="loadingRoutes()"
                    class="flex items-center text-slate-300"
                >
                    <LoadingCircle class="h-9 w-9" />
                    Searching routes...
                </div>
            </div>
        </div>
        <div v-if="showContainer()" class="routes-container">
            <div v-if="thereAreRoutes()" class="flex flex-col gap-3">
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
            <div v-else class="flex justify-center text-slate-300">
                No possible routes
            </div>
        </div>
    </div>
</template>
