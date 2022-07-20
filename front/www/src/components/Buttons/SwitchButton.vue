<script setup lang="ts">
import { ArrowDownIcon } from '@heroicons/vue/outline';

const hover = false
const emits = defineEmits<{
    (event: 'switch'): void
}>();

</script>

<template> 
<div class="flex items-center justify-center w-full">
    <button class="flex items-center justify-center w-full standardArrow"
    @click="emits('switch')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :class="{'arrow-hover': hover}"
    ><ArrowDownIcon class="flex h-7" />
        
    </button>
</div>
</template>