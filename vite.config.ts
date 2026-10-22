/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // E: PWA — تحديث تلقائي بدون ما المستخدم يبوظ بياناته (كلها localStorage)
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Gym App — مدربك الشخصي',
        short_name: 'Gym',
        description: 'خطط جاهزة، تتبع لكل كيلو، وتقرير شهري.',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // شيل SPA: أي تنقل من غير نت يرجع لـ index.html
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // الوسائط هي الأكبر — نتركها للتخزين المؤقت العادي
        runtimeCaching: [
          {
            // الصور/الجيوف والملف اللفظي: cache-first لأنها مثبتة بالشكل دي ثابتة
            urlPattern: /\/media\/.*\.(?:jpe?g|gif|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-v1',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})

