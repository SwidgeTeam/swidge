<script setup lang='ts'>
import { IChain } from '@/domain/metadata/Metadata'
import Ethereum from '@/components/Icons/ChainsLogos/Ethereum.vue'
import Avalanche from '@/components/Icons/ChainsLogos/Avalanche.vue'
import BSC from '@/components/Icons/ChainsLogos/BSC.vue'
import Optimism from '@/components/Icons/ChainsLogos/Optimism.vue'
import Polygon from '@/components/Icons/ChainsLogos/Polygon.vue'
import Arbitrum from '@/components/Icons/ChainsLogos/Arbitrum.vue'
import Cronos from '@/components/Icons/ChainsLogos/Cronos.vue'
import Aurora from '@/components/Icons/ChainsLogos/Aurora.vue'
import Celo from '@/components/Icons/ChainsLogos/Celo.vue'
import Moonriver from '@/components/Icons/ChainsLogos/Moonriver.vue'
import Boba from '@/components/Icons/ChainsLogos/Boba.vue'
import Fuse from '@/components/Icons/ChainsLogos/Fuse.vue'
import Moonbeam from '@/components/Icons/ChainsLogos/Moonbeam.vue'
import Gnosis from '@/components/Icons/ChainsLogos/Gnosis.vue'
import Harmony from '@/components/Icons/ChainsLogos/Harmony.vue'
import FTM from '@/components/Icons/ChainsLogos/FTM.vue'
import Evmos from '@/components/Icons/ChainsLogos/Evmos.vue'

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
            class="px-1 w-16 mb-2"
            :class="[selectedNetworkId !== network.id && selectedNetworkId !== '' && 'opacity-40']"
            @click="onSelect(network.id)">
            <span class="h-11 bg-[#2E283A] rounded-lg flex justify-center items-center">
                <Ethereum 
                v-if="network.id == '1'"
                class="network-switch"></Ethereum>
                <img 
                v-else-if="network.id =='66'"
                src="@/components/Icons/ChainsLogos/OKC.png"
                class="network-switch">
                <img 
                v-else-if="network.id =='128'"
                src="@/components/Icons/ChainsLogos/HECO.png"
                class="network-switch">
                <Aurora
                v-else-if="network.id == '1313161554'"
                class="network-switch"/>
                <Gnosis 
                v-else-if="network.id == '100'"
                class="network-switch"/>
                <FTM 
                v-else-if="network.id == '250'"
                class="network-switch"/>
                <Avalanche 
                v-else-if="network.id == '43114'"
                class="network-switch"/>
                <BSC 
                v-else-if="network.id == '56'"
                class="network-switch"/>
                <Optimism 
                v-else-if="network.id == '10'"
                class="network-switch"/>
                <Polygon 
                v-else-if="network.id == '137'"
                class="network-switch"/>
                <Arbitrum 
                v-else-if="network.id == '42161'"
                class="network-switch"/>
                <Cronos 
                v-else-if="network.id == '25'"
                class="network-switch"/>
                <Celo 
                v-else-if="network.id == '42220'"
                class="network-switch"/>
                <Moonriver 
                v-else-if="network.id == '1285'"
                class="network-switch"/>
                <Boba 
                v-else-if="network.id == '288'"
                class="network-switch"/>
                <Fuse 
                v-else-if="network.id == '122'"
                class="network-switch"/>
                <Evmos 
                v-else-if="network.id == '9001'"
                class="network-switch"/>
                <Moonbeam 
                v-else-if="network.id == '1284'"
                class="network-switch"/>
                <Harmony 
                v-else-if="network.id == '1666600000'"
                class="network-switch"/>
            </span>
        </button>
    </div>
</template>
