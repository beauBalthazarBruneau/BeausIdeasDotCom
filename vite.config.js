import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@world': resolve(__dirname, 'src/world'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@managers': resolve(__dirname, 'src/managers'),
      '@data': resolve(__dirname, 'src/data'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@constants': resolve(__dirname, 'src/constants'),
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
            'src/systems/Background.js',
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
