<script setup lang='ts'>
import { useRoutesStore } from '@/store/routes';

const routesStore = useRoutesStore()

defineProps<{
    content: string,
    value: string,
    name: string,
}>()

const onSlippageChange = (value: string) => {
    routesStore.setSlippage(value)
}

const isChecked = (value: string) => {
    return value === routesStore.getSlippage
}

</script>

<template>
    <div class="ml-1">
        <button
            class="flex grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600"
            :class="{'bg-gray-300 text-slate-800 font-normal ring-white/0 ring-offset-white/0 ring-white/0 ring-offset-white/0' : isChecked(value)}"
            @click="onSlippageChange(value)">{{ content }}</button>
    </div>
</template>
