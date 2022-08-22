<script setup lang='ts'>

const emits = defineEmits<{
  (event: 'updateGasValue'): void,
}>()

defineProps<{
  content: string,
  input: string,
  value: string,
  name: string,
}>()

</script>

<template>
<div class="grid grid-cols-1">
  <div class="relative">
    <input  v-if="value=='medium'" :input="input" v-on:change="emits('updateGasValue')" type="radio" :value=value :name=name class="w-[107px] mx-2 absolute peer h-12 cursor-pointer text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible active:ring-white/0 active:ring-offset-white/0" checked>
    <input  v-if="value!='medium'" :input="input" v-on:change="emits('updateGasValue')" type="radio" :value=value :name=name class="w-[107px] mx-2 absolute peer h-12 cursor-pointer text-center border rounded-lg border-slate-600 bg-white/0 checked:invisible active:ring-white/0 active:ring-offset-white/0">
    <label class="flex grid h-12 mx-2 px-4 py-2 text-center focus:outline-none cursor-pointer border rounded-lg border-slate-600 peer-checked:bg-gray-300 peer-checked:text-slate-800 peer-checked:font-normal" for={{input}}>{{content}}</label>
  </div>
</div>
</template>