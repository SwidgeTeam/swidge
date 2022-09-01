<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/outline'
import { ClockIcon } from '@heroicons/vue/outline'
import VerticalLine from './svg/VerticalLine.vue'
import HorizontalLine from './svg/HorizontalLine.vue'
import Route, { RouteStep } from '@/domain/paths/path'
import AmountFormatter from '@/domain/shared/AmountFormatter'
import StepConnectorArrow from '@/components/Icons/StepConnectorArrow.vue'
import StepIcon from '@/components/Icons/StepIcon.vue'
import Check from '@/components/svg/Check.vue'

const props = defineProps<{
    route: Route
    selectedIndex: number
}>()

const detailsOpen = ref<boolean>(false)

const getExecutionTime = (seconds: number) => {
    if (seconds < 60) {
        return seconds + 's'
    } else {
        const minutes = seconds / 60
        return minutes.toFixed(0) + 'm'
    }
}

const isSelected = computed({
    get: () => {
        return props.route.index === props.selectedIndex
    },
    set: () => null
})

const totalExecutionTime = computed({
    get: () => {
        return getExecutionTime(props.route.resume.executionTime)
    },
    set: () => null
})

const amountOut = computed({
    get: () => {
        return AmountFormatter.format(props.route.resume.amountOut)
    },
    set: () => null
})

const dollarValue = computed({
    get: () => {
        return AmountFormatter.format(props.route.resume.amountOut)
    },
    set: () => null
})

const firstStep = computed({
    get: (): RouteStep => {
        return props.route.steps[0]
    },
    set: () => null
})

const nextSteps = computed({
    get: () => {
        if (props.route.steps.length > 1) {
            return props.route.steps.slice(1, props.route.steps.length)
        }
        return []
    },
    set: () => null
})
</script>


<template>
    <div
        class="route-card"
        :class="{'selected' : isSelected}"
    >
        <div v-if="isSelected" class="checked-mark">
            <Check class="h-4 w-4 m-[2px]"/>
        </div>
        <div class="route-details">
            <div class="flex flex-col field--amount-out pt-2">
                <span class="amount-tokens leading-5 text-right">{{ amountOut }}</span>
                <span class="amount-dollars leading-3 text-right text-[9px] text-slate-500 hover:text-slate-400">≈ ${{
                        dollarValue
                    }}
                    </span>
            </div>
            <div class="flex field--execution-time">
                <ClockIcon class="h-6 pr-1"/>
                {{ totalExecutionTime }}
            </div>
            <div class="flex text-ellipsis field--global-fee">
                $ {{ Number(route.fees.amountInUsd).toFixed(2) }}
            </div>
        </div>
        <div class="route-steps">
            <div
                :href="'#steps-details-' + route.index"
                class="details-line"
                data-bs-toggle="collapse"
                @click="detailsOpen = !detailsOpen"
            >
                <div class="flex justify-left">
                    <ChevronUpIcon
                        v-if="detailsOpen"
                        class="h-6 pr-4 ml-3"/>
                    <ChevronDownIcon
                        v-else
                        class="h-6 pr-4 ml-3"/>
                </div>
                <div>
                    <VerticalLine class="w-2"/>
                </div>
                <div class="flex justify-center items-center gap-3 w-full">
                    <StepIcon :icon="firstStep.tokenIn.icon"/>
                    <StepConnectorArrow :step-type="firstStep.type"/>
                    <StepIcon :icon="firstStep.tokenOut.icon"/>
                    <template
                        v-for="(step, index) in nextSteps"
                        :key="index"
                    >
                        <StepConnectorArrow :step-type="step.type"/>
                        <StepIcon :icon="step.tokenOut.icon"/>
                    </template>
                </div>
            </div>
            <div
                :id="'steps-details-' + route.index"
                class="w-full grid gap-2 items-center px-2 relative collapse"
            >
                <span class="vl"></span>
                <div
                    v-for="(step, index) in route.steps"
                    :key="index"
                    class="flex h-16 items-center relative">
                    <img
                        :src="step.logo"
                        class="relative z-10 w-8 h-8 ml-2 rounded-full"
                        alt="provider logo">
                    <div class="pl-4 w-full">
                        <div class="flex justify-around items-center">
                            <div class="">
                                <div class="flex justify-center items-center">
                                    <StepIcon :icon="step.tokenIn.icon"/>
                                    <StepConnectorArrow :step-type="step.type"/>
                                    <StepIcon :icon="step.tokenOut.icon"/>
                                </div>
                            </div>
                            <div class="mx-1 xs:mx-2 text-xs xs:text-base">
                                $ {{ Number(step.fee).toFixed(2) }}
                            </div>
                            <div class="flex field--execution-time mx-1 text-xs xs:mx-2 xs:text-base">
                                <ClockIcon class="h-6 pr-1"/>
                                {{ getExecutionTime(step.executionTime) }}
                            </div>
                        </div>
                        <div class="absolute bottom-0">
                            <HorizontalLine
                                v-if="index !== Object.keys(route.steps).length - 1"
                                class="w-full mr-4 pr-2 h-1"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
