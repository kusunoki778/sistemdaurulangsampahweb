import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Buka Vite ke jaringan lokal (LAN) supaya halaman bisa dibuka dari
    // HP yang satu WiFi dengan PC saat demo — tanpa hosting.
    host: true,
    // Request /api diteruskan ke backend Laravel di mesin ini, sehingga
    // client.js cukup memakai path relatif '/api' (aman dari device mana pun).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
