<script setup lang='ts'>
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/vue/outline'
import { ref, watchEffect } from 'vue'
import {INetwork} from '@/domain/chains/INetwork'

const scrollContainer = ref()
const isRightScrollable = ref()
const isLeftScrollable = ref()

const props = defineProps<{
  networks: INetwork[]
  selectedNetworkId: string
}>()
const emits = defineEmits<{
  (event: 'update:selected-network-id', selectedNetworkId: string): void
}>()

const isRightScrollableFunc = () => {
    if (!scrollContainer.value || !(scrollContainer.value instanceof HTMLDivElement)) return
    isRightScrollable.value = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth - scrollContainer.value.scrollLeft !== 0
}
const isLeftScrollableFunc = () => {
    if (!scrollContainer.value || !(scrollContainer.value instanceof HTMLDivElement)) return
    isLeftScrollable.value = scrollContainer.value.scrollLeft !== 0
}
const scroll = (value: number) => {
    if (!scrollContainer.value || !(scrollContainer.value instanceof HTMLDivElement)) return
    scrollContainer.value.scrollLeft = scrollContainer.value.scrollLeft + value
    isRightScrollableFunc()
    isLeftScrollableFunc()
}
watchEffect(() => {
    if (scrollContainer.value) {
        isRightScrollableFunc()
        isLeftScrollableFunc()
    }
})

const onSelect = (id: string) => {
    if (id === props.selectedNetworkId) {
        emits('update:selected-network-id', '')
    } else {
        emits('update:selected-network-id', id)
    }
}

</script>

<template>
  <div class="relative flex flex-col gap-2 text-lg font-roboto">
    Select Network:
    <div
ref="scrollContainer"
      class="flex gap-6 py-2 overflow-hidden text-xl text-white border-y border-light-grey-2">
      <button
v-for="network in networks"
        :key="network.id"
        class="flex items-center flex-grow-0 flex-shrink-0 gap-2"
        :class="[selectedNetworkId !== network.id && selectedNetworkId !== '' && 'opacity-50',]"
        @click="onSelect(network.id)">
        <img
:src="network.icon"
          width="36"
          class="rounded-full"
          height="36" />
        <span>{{ network.name }}</span>
      </button>
    </div>
    <ChevronRightIcon
v-if="isRightScrollable"
      class="absolute w-8 top-[46px] -right-7"
      @click="scroll(100)" />
    <ChevronLeftIcon
v-if="isLeftScrollable"
      class="absolute w-8 top-[46px] -left-7"
      @click="scroll(-100)" />
  </div>
</template>
