import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@systems': fileURLToPath(new URL('./src/systems', import.meta.url)),
      '@world': fileURLToPath(new URL('./src/world', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@managers': fileURLToPath(new URL('./src/managers', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
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

    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['matter-js', 'gsap', 'howler'],

          // Core game engine chunk
          core: [
            'src/core/Game.js',
            'src/core/Physics.js',
            'src/core/Camera.js',
            'src/core/InputHandler.js',
          ],

          // Game entities chunk
          entities: ['src/entities/Player.js', 'src/entities/Collectible.js'],

          // Game systems chunk
          systems: [
            'src/systems/AudioManager.js',
            'src/systems/ParticleSystem.js',
            'src/systems/BackgroundRenderer.js',
          ],
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
