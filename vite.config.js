import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // served from site root (custom domain / root deployment)
  build: {
    // This is a feature-rich, client-only SPA (60+ components, all eagerly
    // imported for instant view switching). ~180 kB gzipped is acceptable;
    // raise the warning threshold so the build stays clean.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code into its own chunks so it caches
        // better between deploys.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          icons: ['lucide-react'],
          confetti: ['canvas-confetti'],
        },
      },
    },
  },
})
