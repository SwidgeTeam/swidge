<script setup lang='ts'>

defineProps<{
  content: string,
}>()

</script>

<template>
 <button class="h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 focus:bg-gray-300 focus:text-slate-800 focus:font-normal">
    {{content}} </button>
</template>