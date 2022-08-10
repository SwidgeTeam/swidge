<script setup lang='ts'>
import { CheckCircleIcon } from '@heroicons/vue/outline'
import Spinner from 'vue-spinner/src/ScaleLoader.vue'
import { computed } from 'vue'
import { RouteStep } from '@/domain/paths/path'

const props = defineProps<{
    step: RouteStep
}>()

const title = computed({
    get: () => {
        if (props.step.type === 'swap') {
            return 'Swap on ' + props.step.name
        }
        return 'Transfer via ' + props.step.name
    },
    set: () => null
})

const subtitle = computed({
    get: () => {
        return Number(props.step.amountIn).toFixed(2) + ' ' + props.step.tokenIn.name +
            ' -> ' +
            Number(props.step.amountOut).toFixed(2) + ' ' + props.step.tokenOut.name
    },
    set: () => null
})

</script>

<template>
    <div class="grid grid-cols-12 gap-2 mb-5 mt-5">
        <div
            :class="{'step-gradient' : props.step.completed}"
            class="flex flex-col px-6 py-4 col-span-10 gradient-border-selection-main text-xl items-center">
            <div class="justify-center">
                {{ title }}
            </div>
            <div class="justify-center">
                {{ subtitle }}
            </div>
        </div>
        <div v-if="props.step.completed" class="flex text-green-500 justify-center items-center col-span-2">
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

