<script setup lang='ts'>
import { useRoutesStore } from '@/store/routes'

const routesStore = useRoutesStore()

defineProps<{
    content: string,
    value: string,
    name: string,
}>()

const onGasPriorityChange = (value: string) => {
    routesStore.setGasPriority(value)
}

const isChecked = (value: string) => {
    return value === routesStore.getGasPriority
}


</script>

<template>
    <div class="grid grid-cols-1">
        <div class="relative">
            <button
                class="w-[100px] mx-2 peer h-12 cursor-pointer text-center border rounded-lg border-slate-600"
                :class="{'bg-gray-300 text-slate-800 font-normal ring-white/0 ring-offset-white/0 ring-white/0 ring-offset-white/0' : isChecked(value)}"
                @click="onGasPriorityChange(value)">{{ content }}</button>
        </div>
    </div>
</template>
