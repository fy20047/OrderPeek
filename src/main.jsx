import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 加入 React Router
import "./index.css";

// 匯入頁面
import App from "./App.jsx";         // 首頁（登入畫面）
import Admin from "./pages/Admin.jsx"; // 登入後的管理員頁面
import UserApp from "./pages/UserApp.jsx"; // 登入後的使用者頁面


// 瀏覽器的網址有很多可能：
// / → 登入畫面（App.jsx）
// /admin → 管理員後台（Admin.jsx）
// /app → 使用者前台（UserApp.jsx）
// 如果不加 Router，React 會不知道 /admin 要顯示哪個元件，只會一直顯示 <App />。

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ⭐ BrowserRouter 包住整個 App，讓我們可以用 <Route> 管理不同路徑 */}
    <BrowserRouter>
      <Routes>
        {/* "/" → 預設首頁 → App (登入畫面) */}
        <Route path="/" element={<App />} />

        {/* "/admin" → 管理員頁面 */}
        <Route path="/admin" element={<Admin />} />

        {/* "/app" → 使用者頁面 */}
        <Route path="/app" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
