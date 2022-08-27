import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import NodeModulesPolyfillPlugin from '@esbuild-plugins/node-modules-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis'
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                }),
            ]
        }
    },
    server: {
        hmr: true,
        watch: {
            usePolling: true,
        }
    }
})
