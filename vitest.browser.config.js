import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
      provider: playwright({
        headless: true,
      }),
      testerHtmlPath: resolve(__dirname, 'index.html'),
    },
    include: ['**/*.browser.test.js'], // Only run browser tests
  },
});
