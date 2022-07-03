<script setup lang='ts'>
import { CheckCircleIcon } from '@heroicons/vue/outline'
import Spinner from 'vue-spinner/src/ScaleLoader.vue'
import { computed } from 'vue'

const props = defineProps({
    title: { type: String, required: true },
    tokenIn: { type: String, required: true },
    tokenOut: { type: String, required: true },
    amountIn: { type: String, required: true },
    amountOut: { type: String, required: true },
    completed: { type: Boolean, required: false, default: false },
})

const subtitle = computed({
    get: () => {
        return Number(props.amountIn).toFixed(2) + ' ' + props.tokenIn +
            ' -> ' +
            Number(props.amountOut).toFixed(2) + ' ' + props.tokenOut
    },
    set: () => null
})

</script>

<template>
    <div class="grid grid-cols-12 gap-2 mb-5 mt-5">
        <div
            :class="{'step-gradient' : props.completed}"
            class="flex flex-col px-6 py-4 col-span-10 gradient-border-selection-main text-xl items-center">
            <div class="justify-center">
                {{ props.title }}
            </div>
            <div class="justify-center">
                {{ subtitle }}
            </div>
        </div>
        <div v-if="props.completed" class="flex text-green-500 justify-center items-center col-span-2">
            <CheckCircleIcon class="h-10"/>
        </div>
        <div v-else class="flex justify-center items-center col-span-2">
            <Spinner color="#5b5b5b"/>
        </div>
    </div>
</template>

<style scoped>
.step-gradient {
    background: linear-gradient(270deg, #3E3085 0%, #7C2F82 27.15%, #B22F7F 51.04%, #543E71 78.86%, #0C4966 100%);
}
</style>

