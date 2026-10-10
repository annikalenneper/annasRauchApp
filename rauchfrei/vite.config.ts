import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves the app under /<repo name>/ (case-sensitive).
const base = '/annasRauchApp/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,png,woff2}'] },
      manifest: {
        name: 'Rauchfrei',
        short_name: 'Rauchfrei',
        description: 'Annas Zähler für rauchfreie Tage. Ohne Konto, ohne Tracking.',
        lang: 'de',
        display: 'standalone',
        theme_color: '#f4f6ef',
        background_color: '#f4f6ef',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
