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
      manifest: {
        name: 'Rauchfrei',
        short_name: 'Rauchfrei',
        description: 'Zählt deine rauchfreien Tage. Kostenlos, ohne Konto, ohne Tracking.',
        lang: 'de',
        display: 'standalone',
        theme_color: '#2f7d5b',
        background_color: '#f6f3ec',
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
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/storage/**/*.ts'],
      reporter: ['text'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
