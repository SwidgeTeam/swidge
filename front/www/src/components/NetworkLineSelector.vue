<script setup lang='ts'>
import { IChain } from '@/domain/metadata/Metadata'
import Ethereum from './ChainsLogos/Ethereum.vue'
import Avalanche from './ChainsLogos/Avalanche.vue'
import BSC from './ChainsLogos/BSC.vue'
import Optimism from './ChainsLogos/Optimism.vue'
import Polygon from './ChainsLogos/Polygon.vue'
import Arbitrum from './ChainsLogos/Arbitrum.vue'
import Cronos from './ChainsLogos/Cronos.vue'
import Aurora from './ChainsLogos/Aurora.vue'
import Celo from './ChainsLogos/Celo.vue'
import Moonriver from './ChainsLogos/Moonriver.vue'
import Boba from './ChainsLogos/Boba.vue'
import Fuse from './ChainsLogos/Fuse.vue'
import Moonbeam from './ChainsLogos/Moonbeam.vue'
import Gnosis from './ChainsLogos/Gnosis.vue'
import Harmony from './ChainsLogos/Harmony.vue'
import FTM from './ChainsLogos/FTM.vue'
import Evmos from './ChainsLogos/Evmos.vue'
import Ethereum from './Icons/ChainsLogos/Ethereum.vue'

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
                <img
                    src= 'Logo'
                    class="px-1 py-1 rounded-lg"
                    :alt="network.name"/>
                    
                <Ethereum v-if="network.id == '1'"/> 
                <Gnosis v-else-if="network.id == '100'"/>
                <FTM v-else-if="network.id == '250'"/>
                <Avalanche v-else-if="network.id == '43114'"/>
                <BSC v-else-if="network.id == '56'"/>
                <Optimism v-else-if="network.id == '10'"/>
                <Polygon v-else-if="network.id == '137'"/>
                <Arbitrum v-else-if="network.id == '42161'"/>
                <Cronos v-else-if="network.id == '25'"/>
                <Aurora v-else-if="network.id == '1313161554'"/>
                <Celo v-else-if="network.id == '42220'"/>
                <Moonriver v-else-if="network.id == '1285'"/>
                <Boba v-else-if="network.id == '288'"/>
                <Fuse v-else-if="network.id == '122'"/>
                <Evmos v-else-if="network.id == '9001'"/>
                <Moonbeam v-else-if="network.id == '1284'"/>
                <Harmony v-else-if="network.id == '1666600000'"/>
            </span>
        </button>
    </div>
</template>
