<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoutesStore } from '@/store/routes'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/outline'
import VerticalLine from './svg/VerticalLine.vue'
import HorizontalLine from './svg/HorizontalLine.vue'
import Check from './svg/Check.vue'
import DollarSign from './svg/DollarSign.vue'
import Clock from './svg/Clock.vue'
import StepConnectorArrow from '@/components/Icons/StepConnectorArrow.vue'
import StepIcon from '@/components/Icons/StepIcon.vue'
import ProviderIcon from '@/components/Icons/ProviderIcon.vue'
import Route, { RouteStep } from '@/domain/paths/path'
import AmountFormatter from '@/domain/shared/AmountFormatter'

const routesStore = useRoutesStore()

const props = defineProps<{
    route: Route
    selectedId: string
}>()

const emits = defineEmits<{
    (event: 'select-route', index: string): void
}>()

const detailsOpen = ref<boolean>(false)

/**
 * when a click happens on the domain of the route card
 * @param event
 */
const onClick = (event: Event) => {
    if (!(event.target instanceof HTMLElement)) return
    const isClickOnSteps = hasParentWithClass(event.target.parentElement as HTMLElement, 'route-steps')
    if (!isClickOnSteps) {
        emits('select-route', props.route.id)
    }
}

/**
 * recursively checks if an element or its parents contains a class
 * @param element
 * @param classname
 */
const hasParentWithClass = (element: HTMLElement, classname: string): boolean => {
    const existsHere = element.className.split(' ').indexOf(classname) >= 0
    const existsOnParent = element.parentElement
        ? hasParentWithClass(element.parentElement, classname)
        : false
    return existsHere || existsOnParent
}

/**
 * converts the seconds to a readable string
 * @param seconds
 */
const getExecutionTime = (seconds: number) => {
    if (seconds < 60) {
        return seconds.toFixed(0) + 's'
    } else {
        const minutes = seconds / 60
        return minutes.toFixed(0) + 'm'
    }
}

const tag = computed({
    get: () => {
        if (props.route.tags.length === 0) {
            return ''
        } else if (props.route.tags.length > 1) {
            return 'Best'
        } else {
            return props.route.tags[0].toString()
        }
    },
    set: () => null
})

const isSelected = computed({
    get: () => {
        return props.route.id === props.selectedId
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

const inputDollarValue = computed({
    get: () => {
        const token = routesStore.getOriginToken()
        const inputAmount = routesStore.getSelectedRoute.tx?.value
        console.log(inputAmount)
        if (!token) {
            return '0.0'
        }
        const amount = Number(props.route.resume.amountIn) * Number(token.price)
        return AmountFormatter.format(amount.toFixed(2))
    },
    set: () => null,
})

const outputDollarValue = computed({
    get: () => {
        const tokenOutPrice = routesStore.getDestinationToken()?.price
        if(!tokenOutPrice){
            return '??'
        }
        const usdAmount = Number(tokenOutPrice) * Number(props.route.resume.amountOut)
        return AmountFormatter.format(usdAmount.toString())
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

const priceChangePercerntage = () => {
    const pricePercentage = 100-((Number(inputDollarValue.value))/Number(outputDollarValue.value)*100)
    const fixedPricePercentage = pricePercentage.toFixed(2)
    console.log(fixedPricePercentage)
    return fixedPricePercentage
}
</script>


<template>
    <div
        class="route-card"
        :class="{'selected' : isSelected}"
        @click="onClick"
    >
        <div v-if="isSelected" class="absolute -right-1 -top-1 bg-[#633767] rounded-3xl">
            <Check class="h-4 w-4 m-[2px]"/>
        </div>
        <div
            v-if="route.tags.length > 0"
            class="route-tag"
        >
            {{ tag }}
        </div>
        <div class="route-details ml-2 mt-1">
            <div class="flex flex-col field--amount-out pt-2">
                <span class="amount-tokens leading-5 text-right text-xl">{{ amountOut }}</span>
                <span class="amount-dollars leading-5 text-right text-[13px] text-slate-500 hover:text-slate-400">~ $ {{
                        outputDollarValue 
                    }}
                    (<span v-if="Number(priceChangePercerntage()) >= 0" class="text-green-700">{{priceChangePercerntage()}}%</span>
                    <span v-if="Number(priceChangePercerntage()) < 0" class="text-red-700">{{priceChangePercerntage()}}%</span>)
                </span>
            </div>
            <div class="flex text-ellipsis text-md field--global-fee">
                <DollarSign class="h-6 mr-1"/>
                {{ Number(route.fees.amountInUsd).toFixed(2) }}
            </div>
            <div class="flex text-md field--execution-time">
                <Clock class="h-6 mr-1"/>
                {{ totalExecutionTime }}
            </div>
        </div>
        <div class="route-steps">
            <div
                class="details-line"
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
                        v-for="(step) in nextSteps"
                        :key="step.tokenIn.address"
                    >
                        <StepConnectorArrow
                            :step-type="step.type"/>
                        <StepIcon
                            :icon="step.tokenOut.icon"
                        />
                    </template>
                </div>
            </div>
            <div
                class="w-full grid items-center px-2 relative max-h-0 overflow-hidden transition transition-all duration-400 ease-in-out"
                :class="{'max-h-36':detailsOpen}"
            >
                <span class="vl"></span>
                <div
                    v-for="(step, index) in route.steps"
                    :key="index"
                    class="flex h-12 items-center relative">
                    <ProviderIcon
                        :name="step.name"
                        :logo="step.logo"
                    />
                    <div class="pl-4 w-full">
                        <div class="flex justify-around items-center">
                            <div class="flex justify-center items-center">
                                <StepIcon :icon="step.tokenIn.icon"/>
                                <StepConnectorArrow :step-type="step.type"/>
                                <StepIcon :icon="step.tokenOut.icon"/>
                            </div>
                            <div class="flex mx-1 xs:mx-2 text-xs xs:text-base">
                                <DollarSign class="h-4 xs:h-6 mr-1"/>
                                {{ Number(step.fee).toFixed(2) }}
                            </div>
                            <div class="flex mx-1 xs:mx-2 text-xs xs:text-base field--execution-time ">
                                <Clock class="h-4 xs:h-6 mr-1"/>
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
