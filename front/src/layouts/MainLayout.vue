<script setup lang="ts">
</script>

<template>
  <router-view/>
</template>

<style>
.gradient {
  background-repeat: no-repeat;
  background: -webkit-radial-gradient(hsl(323, 78%, 5%) 5%,
  hsl(323, 78%, 10%) 20%,
  hsl(245, 52%, 5%) 80%) fixed;
  background: -moz-radial-gradient(hsl(323, 78%, 5%) 5%,
  hsl(323, 78%, 10%) 20%,
  hsl(245, 52%, 5%) 80%) fixed;
  background: radial-gradient(hsl(323, 78%, 5%) 5%,
  hsl(323, 78%, 10%) 20%,
  hsl(245, 52%, 5%) 80%) fixed;
}
</style>
