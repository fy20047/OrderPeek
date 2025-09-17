// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// 兼容 ESM，取得 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 讓 "@/xxx" 指到 src/xxx
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 後端
        changeOrigin: true,
        // 如果後端實際沒有 /api 前綴，取消註解下一行
        // rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
