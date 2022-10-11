<script setup lang='ts'>
import { ref } from 'vue'
import CopyIcon from '@/components/Icons/CopyIcon.vue'

const props = defineProps<{
    content: string
}>()

const justCopied = ref<boolean>(false)

const copyContent = () => {
    navigator.clipboard.writeText(props.content)
    justCopied.value = true
    setTimeout(() => {
        justCopied.value = false
    }, 600)
}
</script>

<template>
    <img
        v-if="justCopied"
        src="../../assets/check.svg"
        class="h-4 w-4"
    />
    <CopyIcon
        v-else
        class="h-4 w-4 cursor-pointer"
        @click="copyContent"
    />
</template>
