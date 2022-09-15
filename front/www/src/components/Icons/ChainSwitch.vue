<script>
import Ethereum from '@/Icons/ChainLogos/Ethereum.vue'
import Osmosis from './ChainsLogos/Osmosis.vue'
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

    
</script> 

<template>
    <Ethereum v-if="chain.id == 1"/>
    <Gnosis v-else-if="chain.id == 100"/>
    <FTM v-else-if="chain.id == 250"/>
    <Avalanche v-else-if="chain.id == 43114"/>
    <BSC v-else-if="chain.id == 56"/>
    <Optimism v-else-if="chain.id == 10"/>
    <Polygon v-else-if="chain.id == 137"/>
    <Arbitrum v-else-if="chain.id == 42161"/>
    <Cronos v-else-if="chain.id == 25"/>
    <Aurora v-else-if="chain.id == 1313161554"/>
    <Celo v-else-if="chain.id == 42220"/>
    <Moonriver v-else-if="chain.id == 1285"/>
    <Boba v-else-if="chain.id == 288"/>
    <Fuse v-else-if="chain.id == 122"/>
    <Evmos v-else-if="chain.id == 9001"/>
    <Moonbeam v-else-if="chain.id == 1284"/>
    <Harmony v-else-if="chain.id == 1666600000"/>

</template>