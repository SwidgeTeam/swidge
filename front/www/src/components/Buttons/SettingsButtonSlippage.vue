<script setup lang='ts'>
import { useRoutesStore } from '@/store/routes';

const routesStore = useRoutesStore()

defineProps<{
    content: string,
    value: string,
    name: string,
}>()

const onSlippageChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    routesStore.setSlippage(event.target.value)
}

const isChecked = (value: string) => {
    return value === routesStore.getSlippage
}

</script>

<template>
    <div class="ml-1">
        <input
            :name=name
            :value=value
            :checked="isChecked(value)"
            class="absolute peer w-16 h-12 cursor-pointer mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible focus:ring-white/0 focus:ring-offset-white/0 active:ring-white/0 active:ring-offset-white/0"
            type="radio"
            @change="onSlippageChange">
        <label
            class="flex grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:bg-gray-300 peer-checked:text-slate-800 peer-checked:font-normal"
            for={{name}}>{{ content }}</label>
    </div>
</template>
