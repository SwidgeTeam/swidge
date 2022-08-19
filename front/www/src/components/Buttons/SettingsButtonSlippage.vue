<script setup lang='ts'>

defineProps<{
  content: string,
  input: string,
  value: string,
  name: string,
  attr: string,
}>()

</script>

<template>
<div class="ml-1">
  <input  v-if="value!='2'"  type="radio" :value=value :name=name class="absolute peer w-16 h-12 cursor-pointer mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible focus:ring-white/0 focus:ring-offset-white/0 active:ring-white/0 active:ring-offset-white/0">
  <input  v-if="value=='2'"  type="radio" :value=value :name=name class="absolute peer w-16 h-12 cursor-pointer mx-2 px-4 py-2 text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible focus:ring-white/0 focus:ring-offset-white/0 active:ring-white/0 active:ring-offset-white/0" checked>
  <label class="flex grid w-16 h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:bg-gray-300 peer-checked:text-slate-800 peer-checked:font-normal" for={{input}} >{{content}}</label>
</div>
</template>