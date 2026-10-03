import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    cors: true,
    allowedHosts: ['.trycloudflare.com', 'thru-lows-studied-readings.trycloudflare.com', '.loca.lt'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1200
  }
});
