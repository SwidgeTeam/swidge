<script setup lang="ts">
import { ArrowDownIcon } from '@heroicons/vue/outline'

const emits = defineEmits<{
    (event: 'switch-tokens'): void
}>()

</script>

<template>
    <div class="flex justify-center -mt-3 -mb-3 z-10">
        <button
            class="flex w-8 h-8 border border-[#54545F] rounded-2xl bg-[#2F283A]/100 items-center justify-center standardArrow"
            @click="emits('switch-tokens')"
        >
            <ArrowDownIcon
                class="w-5 h-5 text-slate-200"/>
        </button>
    </div>
</template>
