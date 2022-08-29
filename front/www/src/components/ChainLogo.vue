<script setup lang="ts">
const props = defineProps<{
    logo: string
    size: string
}>()

const getPad = () => {
    return (Number(props.size) * 0.66).toFixed(0)
}

</script>

<template>
    <img
        :style="`width: ${size}px; height: ${size}px; top: -${getPad()}px; right: -${getPad()}px`"
        :src="logo"
        class="rounded-full absolute shadow-lg shadow-black"
        alt="chain logo"
    />
</template>
