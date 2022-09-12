<script setup lang="ts">
import TwitterLogo from '@/components/svg/TwitterLogo.vue'
import DiscordLogo from '@/components/svg/DiscordLogo.vue'
</script>

<template>
   <h1 class="text-white-500 font-extrabold flex flex-col text-center">
    <span class="text-5xl">Coming Soon!</span>
    <span class="text-3xl mt-5 mb-10">Follow us on Twitter and join our Discord to stay updated.</span>
    <div class="flex flex-auto place-content-center items-center align-center">
      <a href="https://twitter.com/therealswidge">
        <TwitterLogo class="w-10 h-10 itmes-center align-center"></TwitterLogo>
      </a>
      <a href="https://discord.swidge.xyz/">
        <DiscordLogo class="w-10 h-10 items-center align-center" ></DiscordLogo>
      </a>
  </div>
  </h1>
</template>