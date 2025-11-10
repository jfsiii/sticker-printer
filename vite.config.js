import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths so dist/index.html works when opened directly
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
