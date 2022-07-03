<script setup lang='ts'>
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import { computed } from 'vue'

const props = defineProps<{
  list: string[]
  selected: string
}>()

const emits = defineEmits<{
  (event: 'update:selected', name: string): void
}>()

const selectedComputed = computed({
    get: () => props.selected,
    set: (value: string) => emits('update:selected', value)
})

</script>

<template>
  <Listbox
v-model="selectedComputed"
    as="div">
    <div class="mt-1 relative text-base w-32">
      <ListboxButton
        class="relative w-full border border-light-grey-1 rounded-full pl-3 pr-6 py-1 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <span class="block truncate">{{ selected }}</span>
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
class="h-5 w-5"
            aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <ListboxOptions
          class="absolute z-10 mt-1 w-full border bg-background-main-dark border-light-grey-1 max-h-60 rounded-md py-1 text-base ring-opacity-5 overflow-auto focus:outline-none">
          <ListboxOption
v-for="item in list"
            :key="item"
            v-slot="{ active, selected }"
            as="template"
            :value="item">
            <li
              :class="[active ? 'text-white bg-indigo-600' : 'text-light-grey-1', 'cursor-default select-none relative py-1 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal']">
                {{ item }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
