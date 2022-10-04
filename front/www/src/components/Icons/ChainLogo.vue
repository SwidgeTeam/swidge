<script setup lang="ts">
const props = defineProps<{
    logo: string
    size: string
}>()
const getPad = () => {
    return (Number(props.size) * 0.5).toFixed(0)
}
</script>

<template>
    <img
        v-if="props.size"
        :style="`width: ${size}px; height: ${size}px; top: -${getPad()}px; right: -${getPad()}px`"
        :src="logo"
        class="rounded-full absolute shadow-lg shadow-black"
        alt="chain logo"
    />
    <img
        v-else
        :src="logo"
        class="rounded-full absolute shadow-lg shadow-black w-[1rem] md:w-[1.5rem] top-[-20%] right-[-20%]"
        alt="chain logo"
    />
</template>
