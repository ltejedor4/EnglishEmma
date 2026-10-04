import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Emma English',
        short_name: 'Emma',
        description: 'Inglés jugando con Buddy',
        lang: 'en',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#1e2a4a',
        theme_color: '#1e2a4a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Todo precacheado (audios incluidos, ~4 MB) para que funcione sin internet.
        globPatterns: ['**/*.{js,css,html,mp3,webp,png,svg}'],
      },
    }),
  ],
})
