import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = process.env.BASE_URL ?? '/'

export default defineConfig({
  base: BASE,
  server: { host: true },
  preview: { host: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigationPreload: false,
      },
      manifest: {
        name: '记账本',
        short_name: '记账本',
        description: '简单记账工具',
        lang: 'zh-CN',
        start_url: BASE,
        scope: BASE,
        theme_color: '#f5efe0',
        background_color: '#fdf8f0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/icon-180.png', sizes: '180x180', type: 'image/png' },
        ],
      },
    }),
  ],
})
