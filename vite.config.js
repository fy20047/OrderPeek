import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Spring Boot 後端
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
        // 如果後端實際路徑沒有 /api 前綴，打的是 /auth/login，則加上：
        // rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
