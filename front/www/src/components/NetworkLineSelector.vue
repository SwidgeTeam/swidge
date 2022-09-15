<script setup lang='ts'>
import { IChain } from '@/domain/metadata/Metadata'
import Ethereum from '@Icons/ChainsLogos/Ethereum.svg'

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
    <div class="relative gird grid-cols-3 gap-2 font-roboto">
        <button
            v-for="network in networks"
            :key="network.id"
            class="px-1 w-16"
            :class="[selectedNetworkId !== network.id && selectedNetworkId !== '' && 'opacity-40']"
            @click="onSelect(network.id)">
            <span class="h-10 bg-[#2E283A] rounded-lg flex justify-center">
                <Ethereum
                    :src="network.logo"
                    class="px-1 py-1 rounded-lg"
                    :alt="network.name"/>
            </span>
        </button>
    </div>
</template>
