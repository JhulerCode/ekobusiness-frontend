import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
        vue(),
        vueDevTools(),
        VitePWA({
            registerType: 'prompt', // Cambiado a 'prompt' para permitir notificación de actualización
            workbox: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                cleanupOutdatedCaches: true,
            },
            includeAssets: ['robots.txt', 'apple-touch-icon.png'], //apple 180x180 px
            manifest: {
                name: 'ITD ERP',
                short_name: 'ITD ERP',
                description: 'ITD ERP',
                start_url: '/signin',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#2492c2',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [
                    {
                        src: 'screenshot1.png',
                        sizes: '540x720',
                        type: 'image/png',
                        form_factor: 'wide',
                    },
                    {
                        src: 'screenshot2.png',
                        sizes: '540x720',
                        type: 'image/png',
                        // sin form_factor para mobile
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
