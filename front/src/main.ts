import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { createHead } from '@vueuse/head'
import generatedRoutes from 'virtual:generated-pages'
import { createPinia } from 'pinia';

import '@/styles/index.css'

const routes = setupLayouts(generatedRoutes)
const head = createHead()
const pinia = createPinia();

const router = createRouter({
    history: createWebHistory(),
    routes,
})


const app = createApp(App)
app.use(pinia);
app.use(router)
app.use(head)
app.mount('#app')


