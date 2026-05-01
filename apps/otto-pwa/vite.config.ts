import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = (name: string) =>
  path.resolve(__dirname, `../../packages/${name}/src/index.ts`)

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'OTTO - Otorrinolaringologia',
        short_name: 'OTTO',
        description: 'Plataforma de suporte clínico para otorrinolaringologia',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      // Aliases explícitos para pacotes do workspace → aponta direto para o fonte TypeScript.
      // Isso garante que o Rollup nunca depende do campo "main" do package.json dos packages
      // (que aponta para ./dist/index.js, inexistente no Vercel).
      '@otto/shared-types':    pkg('shared-types'),
      '@otto/shared-auth':     pkg('shared-auth'),
      '@otto/shared-firebase': pkg('shared-firebase'),
      '@otto/shared-ui':       pkg('shared-ui'),
      '@otto/shared-ontology': pkg('shared-ontology'),
      '@otto/shared-utils':    pkg('shared-utils'),
      '@':                     path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'firebase':     ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'query':        ['@tanstack/react-query'],
          'charts':       ['recharts'],
        },
      },
    },
  },
})
