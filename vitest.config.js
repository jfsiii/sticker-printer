import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // Increase forks pool timeout to avoid startup issues
    poolOptions: {
      forks: {
        execArgv: [],
      },
    },
    hookTimeout: 30000, // 30 seconds for pool startup
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.browser.test.js', // Exclude browser tests from unit tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '*.config.js',
      ],
    },
  },
});
