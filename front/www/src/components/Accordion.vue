<script setup lang='ts'>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/vue/outline'
defineProps<{
  header: string
  text: string
}>()

</script>

<template>
  <Disclosure
v-slot="{ open }"
    as="div"
    class="p-6 bg-cards-background-dark-grey w-[38rem] rounded-xl ease-in-out duration-700">
    <h3 class="-my-3 flow-root">
      <DisclosureButton class="py-3 w-full flex items-center justify-between">
        <span class="text-xl">
          {{ header }}
        </span>
        <span class="ml-6 flex items-center">
          <PlusCircleIcon
            v-if="!open"
            class="h-6 w-6"
            aria-hidden="true" />
          <MinusCircleIcon
            v-else
            class="h-6 w-6"
            aria-hidden="true" />
        </span>
      </DisclosureButton>
    </h3>
    <DisclosurePanel class="pt-3">
      <div class="space-y-4">
        <p class="flex items-center text-base font-extralight">
          {{ text }}
        </p>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
