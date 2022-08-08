import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
    },
    plugins: [
        vue(),
        Pages(),
        Layouts({
            defaultLayout: 'MainLayout'
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        include: ['vue', 'vue-router', '@vueuse/core', '@vueuse/head'],
        exclude: ['vue-demi'],
    },
    server: {
        hmr: true,
        watch: {
            usePolling: true,
        }
    }
})
