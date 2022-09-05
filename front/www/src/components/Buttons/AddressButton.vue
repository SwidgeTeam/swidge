<script setup lang='ts'>
import WalletIcon from '@/components/svg/WalletIcon.vue'
import Address from '@/domain/shared/address'

defineProps<{
    address: string
}>()

const emits = defineEmits<{
    (event: 'click'): void
}>()

const createShortAddress = (address: string): string => {
    return new Address(address).shortFormat()
}

const createShorterAddress = (address: string): string => {
    return new Address(address).extraShortFormat()
}

</script>

<template>
    <button
        class="header-button"
        @click="emits('click')"
    >
        <WalletIcon/>
        <span class="hidden sm:block">{{ createShortAddress(address) }}</span>
        <span class="block sm:hidden">{{ createShorterAddress(address) }}</span>
    </button>
</template>
