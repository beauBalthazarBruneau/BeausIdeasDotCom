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

    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['matter-js', 'gsap', 'howler'],

          // Game engine chunk
          game: [
            'src/game/Game.js',
            'src/game/Physics.js',
            'src/game/Camera.js',
            'src/game/InputHandler.js',
            'src/game/Player.js',
            'src/game/Platform.js',
          ],

          // Rendering chunk
          rendering: [
            'src/rendering/Audio.js',
            'src/rendering/Particles.js',
            'src/rendering/Background.js',
            'src/rendering/UI.js',
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
