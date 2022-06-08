<script setup lang='ts'>
import { SearchIcon } from '@heroicons/vue/solid'
defineProps<{
  searchTerm: string
  placeholder: string
}>()
const emits = defineEmits<{
  (event: 'update:searchTerm', searchTerm: string): void,
}>()

const onInput = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    emits('update:searchTerm', event.target.value)
}
</script>

<template>
  <div class="relative mt-1 rounded-md shadow-sm">
    <div
      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <SearchIcon
class="w-6 h-6 text-light-grey-1"
        aria-hidden="true" />
    </div>
    <input
id="searchTerm"
      type="text"
      :value="searchTerm"
      name="searchTerm"
      class="block w-full pl-10 rounded-md font-roboto border-light-grey-2 bg-cards-background-dark-grey focus:ring-indigo-500 focus:border-indigo-500 text-light-grey-1"
      :placeholder="placeholder"
      @input="onInput" />
  </div>
</template>