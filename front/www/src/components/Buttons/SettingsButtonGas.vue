<script setup lang='ts'>

import { useRoutesStore } from '@/store/routes';

const routesStore = useRoutesStore()

defineProps<{
    content: string,
    value: string,
    name: string,
}>()

const onGasChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    routesStore.setGas(event.target.value)
}

const isChecked = (value: string) => {
    return value === routesStore.getGas
}


</script>

<template>
    <div class="grid grid-cols-1">
        <div class="relative"> 
            <input
                :name=name
                :value=value
                :checked="isChecked(value)"
                class="w-[107px] mx-2 absolute peer h-12 cursor-pointer text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible active:ring-white/0 active:ring-offset-white/0"
                type="radio"
                @change="onGasChange">
            <label
                class="flex grid h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:bg-gray-300 peer-checked:text-slate-800 peer-checked:font-normal"
                for={{input}}>{{ content }}</label>
        </div>
    </div>
</template>
