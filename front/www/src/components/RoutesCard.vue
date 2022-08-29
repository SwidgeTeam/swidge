<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/outline'
import VerticalLine from './svg/VerticalLine.vue'
import { ClockIcon } from '@heroicons/vue/outline'
import Route from '@/domain/paths/path'
import SwidgeLogoNoText from './svg/SwidgeLogoNoText.vue'
import HorizontalLine from './svg/HorizontalLine.vue'
import { useTokensStore } from '@/store/tokens'
import { Networks } from '@/domain/chains/Networks'
import TokenLogo from './TokenLogo.vue'
import ChainLogo from './ChainLogo.vue'
import AmountFormatter from '@/domain/shared/AmountFormatter'
import { ref } from 'vue'

const tokensStore = useTokensStore()

const props = defineProps<{
    route: Route
    unique: number
}>()

const detailsOpen = ref<boolean>(false)

const getOriginChainLogo = () => {
    const chainId = tokensStore.getOriginChainId
    return Networks.get(chainId).icon
}
const getOriginTokenLogo = () => {
    return tokensStore.getOriginToken()?.logo
}
const getDestinationTokenLogo = () => {
    return tokensStore.getDestinationToken()?.logo
}
const getExecutionTime = () => {
    if (props.route.resume.executionTime < 60) {
        return props.route.resume.executionTime + 's'
    } else {
        const minutes = props.route.resume.executionTime / 60
        return minutes.toFixed(0) + 'm'
    }
}
const amountOut = () => {
    return AmountFormatter.format(props.route.resume.amountOut)
}
const dollarValue = () => {
    return AmountFormatter.format(props.route.resume.amountOut)
}
</script>

<template>
    <div
        class="relative flex flex-col gap-6 px-8 py-4 rounded-3xl bg-cards-background-dark-grey gradient-border-selection-main max-w-xl">
        <div
            class="absolute -top-4 left-6 rounded-3xl bg-cards-background-dark-grey px-2 gradient-border-selection-main">
            RouteType
        </div>
        <div class="relative flex flex-col gap-4 py-2">
            <div class="flex items-center justify-between px-4 text-2xl h-16">
                <div class="relative scale-100">
                    <TokenLogo :logo="getOriginTokenLogo()" size="24"/>
                    <ChainLogo :logo="getOriginChainLogo()" size="14"/>
                </div>
                <div class="flex flex-col field--amount-out">
                    <span class="amount-tokens">{{ amountOut() }}</span>
                    <span class="amount-dollars text-sm text-slate-500 hover:text-slate-400">≈ $ {{ dollarValue() }}</span>
                </div>
                <div class="flex field--execution-time">
                    <ClockIcon class="h-6 pr-1"/>
                    {{ getExecutionTime() }}
                </div>
                <div class="flex text-ellipsis field--global-fee">
                    $ {{ Number(route.fees.amountInUsd).toFixed(2) }}
                </div>
            </div>
            <div class=" bg-[#222129]/40 rounded-2xl block--steps">
                <div
                    :href="'#step-details-' + unique"
                    class="relative flex justify-left items-center cursor-pointer shadow-lg px-2 rounded-2xl hover:bg-[#222129]/100 transition duration-150 ease-out hover:ease-in py-4"
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
                        <VerticalLine/>
                    </div>
                    <div class="flex justify-center items-center gap-4 w-full">
                        <div class="flex justify-center items-center gap-4 w-full">
                            <img :src="getOriginTokenLogo()" class="h-12 w-12 rounded-full">
                            <SwidgeLogoNoText class="h-12 w-12 rounded-full"/>
                            <img :src="getDestinationTokenLogo()" class="h-12 w-12 rounded-full">
                        </div>
                    </div>
                </div>
                <div
                    :id="'step-details-' + unique"
                    class="justify-left w-full grid gap-2 items-center px-2 vl-parent collapse"
                >
                    <span class="vl"></span>
                    <div
                        v-for="(step, index) in route.steps"
                        :key="index"
                        class="py-2">
                        <img
                            :src="step.logo"
                            class="w-8 h-8 ml-2 step-icon"
                            alt="provider logo">
                        <div class="flex justify-right items-center pl-24 pt-4">
                            <HorizontalLine class="w-full mr-4"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
