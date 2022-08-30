<script setup lang='ts'>
defineProps<{
    address: string
}>()

const emits = defineEmits<{
    (event: 'click'): void
}>()

const createShortAddress = (address: string): string => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4)
}

const createShorterAddress = (address: string): string => {
    return address.substring(0, 6) + '...'
}

</script>

<template>
    <button
        class="header-button"
        @click="emits('click')"
    >
        <span class="hidden sm:block">{{ createShortAddress(address) }}</span>
        <span class="block sm:hidden">{{ createShorterAddress(address) }}</span>
    </button>
</template>
