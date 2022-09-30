<script setup lang='ts'>
import { ref } from 'vue'
import Check from '@/components/svg/Check.vue'
import Copy from '@/components/svg/Copy.vue'

const props = defineProps<{
    content: string
}>()

const justCopied = ref<boolean>(false)

const copyContent = () => {
    navigator.clipboard.writeText(props.content)
    justCopied.value = true
    setTimeout(() => {
        justCopied.value = false
    }, 1000)
}
</script>

<template>
    <Check v-if="justCopied"/>
    <Copy
        v-else
        class="cursor-pointer"
        @click="copyContent"/>
</template>
