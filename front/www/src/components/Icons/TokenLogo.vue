<script setup lang="ts">
const props = defineProps<{
    tokenLogo: string
    chainLogo: string
    size: string
}>()

const replaceByDefault = (e: Event) => {
    const imageTarget = e.target as HTMLImageElement
    imageTarget.src = props.chainLogo
}
</script>

<template>
    <img
        :style="`width: ${size}px; height: ${size}px`"
        :src="tokenLogo"
        class="rounded-full object-center relative bot-0 top-0 shadow-lg shadow-black"
        alt="token logo"
        @error="replaceByDefault"
    />
</template>
