import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies API + uploaded photos to the Express backend on :3001,
// so the client and server share an origin during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001'
    }
  }
});
