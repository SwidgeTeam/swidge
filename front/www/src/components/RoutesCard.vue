<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'
import VerticalLine from './svg/VerticalLine.vue'
import { ClockIcon } from '@heroicons/vue/outline'
import Route from '@/domain/paths/path';


defineProps<{
    route: Route
}>()


</script>

<template>
    <div class="relative flex flex-col gap-6 px-8 py-4 rounded-3xl bg-cards-background-dark-grey gradient-border-selection-main max-w-xl">
        <div class="absolute -top-4 left-6 rounded-3xl bg-cards-background-dark-grey px-2 gradient-border-selection-main">RouteType</div>
        <div class="flex flex-col gap-4 py-2">
            <div class="flex items-center justify-between px-4">
                <div>
                    icon
                </div>
                <div>
                    {{route.tx?.value}}
                </div>
                <div class="flex">
                    <ClockIcon class="h-6 pr-1"/>
                    {{route.steps.length}}
                </div>
                <div class="flex text-ellipsis">
                    $
                    {{route.fees.amountInUsd}}
                </div>
            </div>
            <div class="relative flex justify-left items-center cursor-pointer bg-[#222129]/40 px-2 rounded-2xl hover:bg-[#222129]/100 transition duration-150 ease-out hover:ease-in py-4">
                <div class="flex justify-left">
                <ChevronDownIcon class="h-6 pl-2 pr-4"/>
                </div>
                <div>
                    <VerticalLine/>
                </div>
                <div class="flex justify-center items-center gap-4 w-full">
                    <div v-for="steps in route.steps">{{steps.name}}</div>
                </div>
            </div>
        </div>
    </div>
</template>