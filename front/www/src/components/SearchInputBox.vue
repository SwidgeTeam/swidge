<script setup lang='ts'>
import { SearchIcon } from '@heroicons/vue/solid'
import {TrashIcon} from '@heroicons/vue/outline'
import { ref } from 'vue'
const searchBox = ref<HTMLInputElement | null>(null)
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
const resetInput = () => {
    emits('update:searchTerm', "");
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
        class="w-6 h-6 text-light-grey-1"
        aria-hidden="true" />
    </div>
    <TrashIcon v-if="searchTerm!=''"
      class="absolute w-4 top-3 right-3 cursor-pointer"
      @click="resetInput"
    />
    <input
      id="searchTerm"
      ref="searchBox"
      type="text"
      :value="searchTerm"
      name="searchTerm"
      class="block w-full pl-10 rounded-md font-roboto border-light-grey-2 bg-cards-background-dark-grey ring-1 ring-indigo-500 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 text-light-grey-1"
      :placeholder="placeholder"
      @input="onInput" />
  </div>
</template>