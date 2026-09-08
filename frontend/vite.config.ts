import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) || 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
