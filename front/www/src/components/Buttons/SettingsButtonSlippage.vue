<script setup lang='ts'>

defineProps<{
  content: string,
  input: string,
  value: string,
  name: string,
}>()

</script>

<template>
<div class="ml-1">
  <input type="radio" :value=value :name=name class="sr-only peer w-16 h-12 mx-2 px-4 py-2 text-center border rounded-lg border-slate-600">
  <label class="flex grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:bg-gray-300 peer-checked:text-slate-800 peer-checked:font-normal" for={{input}}>{{content}}</label>
  <div></div>
</div>
</template>