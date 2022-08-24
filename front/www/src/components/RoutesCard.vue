<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/outline'


</script>

<template>
    <div class="relative flex flex-col gap-6 px-12 py-6 rounded-3xl bg-cards-background-dark-grey gradient-border-selection-main">
        <div class="absolute -top-4 left-6 rounded-3xl bg-cards-background-dark-grey px-2 gradient-border-selection-main">RouteType</div>
        <div class="flex flex-col gap-4 py-4">
            <div class="flex items-center justify-between">
                <div>icon</div>
                <div>money</div>
                <div>time</div>
                <div>gas</div>
            </div>
            <div class="relative flex items-center justify-between cursor-pointer bg-[#222129]/40 px-2 py-1 rounded-2xl hover:bg-[#222129]/100 transition duration-150 ease-out hover:ease-in py-6">
                <div class="flex justify-left">
                <ChevronDownIcon class="h-6 pl-2"/>
                </div>
                <div class="flex justify-self-center gap-4 ">
                    <div>icon</div>
                    <div>icon</div>
                    <div>icon</div>
                </div>
            </div>
        </div>
    </div>
</template>