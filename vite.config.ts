import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/money-tracker/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '记账本',
        short_name: '记账本',
        description: '简单记账工具',
        theme_color: '#f5efe0',
        background_color: '#fdf8f0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
})
