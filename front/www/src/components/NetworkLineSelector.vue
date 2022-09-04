<script setup lang='ts'>
import { IChain } from '@/domain/metadata/Metadata'

const props = defineProps<{
    networks: IChain[]
    selectedNetworkId: string
}>()

const emits = defineEmits<{
    (event: 'update:selected-network-id', selectedNetworkId: string): void
}>()

const onSelect = (id: string) => {
    if (id === props.selectedNetworkId) {
        emits('update:selected-network-id', '')
    } else {
        emits('update:selected-network-id', id)
    }
}

</script>

<template>
    <div class="relative gird grid-flow-col-dense gap-2 font-roboto">
        <button
            v-for="network in networks"
            :key="network.id"
            class="px-1"
            :class="[selectedNetworkId !== network.id && selectedNetworkId !== '' && 'opacity-40']"
            @click="onSelect(network.id)">
            <img
                :src="network.logo"
                class="rounded-full"
                width="36"
                height="36"
                :alt="network.name"/>
        </button>
    </div>
</template>
