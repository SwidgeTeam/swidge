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
        :src="tokenLogo"
        class="rounded-full object-center relative bot-0 top-0 shadow-lg shadow-black w-[1.5rem] h-[1.5rem] md:w-[2.5rem] md:h-[2.5rem] max-w-[50px] max-h-[50px] mr-0"
        alt="token logo"
        @error="replaceByDefault"
    />
</template>
<!-- :style="`max-width: ${size}px; max-height: ${size}px`" -->
