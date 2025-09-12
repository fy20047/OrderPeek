// // 簡易的 API URL 管理
// // - 優先使用 Vite 環境變數 VITE_API_BASE（於 .env.[mode] 設定）
// // - 未設定時，預設使用本機後端 http://localhost:8080（開發用）
// export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 開發模式走相對路徑 → 交給 Vite 代理；正式模式用環境變數
export const API_BASE = import.meta.env.DEV
  ? "" // dev: 讓 fetch('/api/...') 走 5173 的代理
  : (import.meta.env.VITE_API_BASE || ""); // prod: 例如 https://api.orderpeek.com

// 將相對路徑轉為完整 API URL，例如 apiUrl('/api/auth/login')
export function apiUrl(path) {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE}${path}`;


}

