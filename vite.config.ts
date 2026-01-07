import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ensure client-side routing works in production
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
