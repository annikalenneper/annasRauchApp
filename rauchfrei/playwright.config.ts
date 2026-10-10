import { defineConfig } from '@playwright/test';

const PORT = 4173;

// Smoke test of the main flows against the production build.
export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}/annasRauchApp/`,
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    serviceWorkers: 'block',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
  },
});
