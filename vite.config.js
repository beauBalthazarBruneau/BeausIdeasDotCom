import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@rendering': fileURLToPath(new URL('./src/rendering', import.meta.url)),
      '@world': fileURLToPath(new URL('./src/world', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },

  // Development server configuration
  server: {
    host: true,
    port: 5173,
    open: true,
  },

  // Build optimizations
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',

    // Code splitting - game code is dynamically imported, so let Rollup
    // handle the split naturally. Only group vendor libs together.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/matter-js') ||
              id.includes('node_modules/gsap') ||
              id.includes('node_modules/howler')) {
            return 'vendor';
          }
        },
      },
    },

    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Plugin configuration
  plugins: [],

  // Preview configuration (for build preview)
  preview: {
    port: 4173,
    open: true,
  },
});
