import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        //     VitePWA({
        //       registerType: 'autoUpdate',
        //       workbox: {
        //         maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        //       },
        //       includeAssets: ['robots.txt', 'apple-touch-icon.png'], //apple 180x180 px
        //       manifest: {
        //         name: 'Eko Business App',
        //         short_name: 'Eko Business App',
        //         description: 'Eko Business App',
        //         start_url: '/signin',
        //         display: 'standalone',
        //         background_color: '#ffffff',
        //         theme_color: '#2c47aa',
        //         icons: [
        //           {
        //             src: 'pwa-192x192.png',
        //             sizes: '192x192',
        //             type: 'image/png'
        //           },
        //           {
        //             src: 'pwa-512x512.png',
        //             sizes: '512x512',
        //             type: 'image/png'
        //           },
        //           {
        //             src: 'pwa-maskable-512x512.png',
        //             sizes: '512x512',
        //             type: 'image/png',
        //             purpose: 'maskable'
        //           }
        //         ],
        //         screenshots: [
        //           {
        //             src: 'screenshot1.png',
        //             sizes: '540x720',
        //             type: 'image/png',
        //             form_factor: 'wide'
        //           },
        //           {
        //             src: 'screenshot2.png',
        //             sizes: '540x720',
        //             type: 'image/png'
        //             // sin form_factor para mobile
        //           }
        //         ]
        //       }
        //     })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
})
