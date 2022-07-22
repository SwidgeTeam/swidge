<script setup lang="ts">
import { ArrowDownIcon } from '@heroicons/vue/outline'
// eslint-disable-next-line vue/no-export-in-script-setup

var hover = false

const emits = defineEmits<{
    (event: 'switch'): void
}>()

</script>

<template> 
<div class="flex items-center justify-center w-full">
    <button 
    class="flex items-center justify-center w-full standardArrow"
    :class="{'arrow-hover': hover}"
    @click="emits('switch')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    ><ArrowDownIcon class="flex h-7" />
        
    </button>
</div>
</template>