<script setup lang='ts'>
import { SearchIcon } from '@heroicons/vue/solid'
import { XCircleIcon } from '@heroicons/vue/outline'
import { ref } from 'vue'

const searchBox = ref<HTMLInputElement | null>(null)

defineProps<{
    searchTerm: string
}>()

const emits = defineEmits<{
    (event: 'update:searchTerm', searchTerm: string): void,
    (event: 'clear-input'): void,
}>()

const onInput = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    emits('update:searchTerm', event.target.value)
}

const resetInput = () => {
    emits('clear-input')
    searchBox.value?.focus()
}

const focusInput = () => {
    searchBox.value?.focus()
}

defineExpose({
    focusInput
})

</script>

<template>
    <div class="relative mt-1 rounded-md shadow-sm">
        <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon
                class="w-8 h-8 text-light-grey-1"
                aria-hidden="true"/>
        </div>
        <XCircleIcon
            v-if="searchTerm"
            class="absolute w-6 top-4 right-3 cursor-pointer"
            @click="resetInput"
        />
        <input
            id="searchTerm"
            ref="searchBox"
            type="text"
            :value="searchTerm"
            name="searchTerm"
            class="text-sm sm:text-base w-full pl-12 h-14 rounded-lg font-roboto border-light-grey-2 bg-cards-background-dark-grey ring-1 ring-indigo-500 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 text-light-grey-1"
            placeholder="Search by symbol or address"
            @input="onInput"/>
    </div>
</template>
