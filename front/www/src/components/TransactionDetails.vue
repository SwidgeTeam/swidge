<script setup lang="ts">
const props = defineProps<{
    totalFee: string
}>()
</script>

<template>
    <div class="flex flex-col gap-4">
        <span class="text-2xl">Transaction Settings: </span>
        <div class="flex justify-between">
            <span class="font-light text-xl"> Total fees </span>
            <span class="flex items-end"> ≈ {{ props.totalFee }} USD</span>
        </div>
    </div>
</template>
