import React, { useState } from "react";
import { apiUrl } from "../config"; // 統一管理 API 基底網址（見 src/config.js）
import { useNavigate } from "react-router-dom"; // 使用官方路由 hook，避免整頁重新載入
import ErrorMessage from "@/shared/components/ErrorMessage.jsx";
import { setRole } from "@/features/auth/api.js";

export default function Login() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 登入失敗或網路錯誤時顯示
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  /**
   * 提交登入表單：
   * - 先阻止預設提交行為
   * - 呼叫後端登入 API
   * - 依回傳角色導向管理或使用者頁面
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 避免重複點擊

    setError("");
    setLoading(true); // 送出前啟用 loading 狀態

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
        // 若改為 Cookie/Session 驗證，需開啟 credentials 並調整後端 CORS
        // credentials: "include",
      });

      const text = await res.text(); // 後端可能回傳非 JSON，先以文字接收
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (res.ok && data?.role) {
        setRole(data.role); // 記住角色予路由判斷使用
        if (data.role === "ADMIN") {
          nav("/admin", { replace: true });
        } else if (data.role === "USER") {
          nav("/app", { replace: true });
        } else {
          setError(`登入成功，但角色未知：${data.role}`);
        }
      } else {
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("無法連線到伺服器");
    } finally {
      setLoading(false); // 完成後恢復按鈕狀態
    }
  };

  /**
   * 輸入欄說明：
   * - Enter 直接提交表單
   * - label.htmlFor 對應 input.id 以提升無障礙體驗
   * - autoComplete 幫助瀏覽器記住帳密
   */

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      <label className="label" htmlFor="account">帳號</label>
      <input
        id="account"
        type="text"
        className="input"
        placeholder="請輸入帳號"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        autoComplete="username"
        required
        inputMode="text"
      />

      <label className="label" htmlFor="password">密碼</label>
      <input
        id="password"
        type="password"
        className="input"
        placeholder="請輸入密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <button
        className="submitBtn"
        type="submit"
        disabled={loading}
        onClick={(e) => {
          const btn = e.currentTarget;
          const circle = document.createElement("span");
          const diameter = Math.max(btn.clientWidth, btn.clientHeight);
          const radius = diameter / 2;

          circle.style.width = circle.style.height = `${diameter}px`;
          circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
          circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;
          circle.classList.add("ripple");

          const ripple = btn.getElementsByClassName("ripple")[0];
          if (ripple) ripple.remove();
          btn.appendChild(circle);
        }}
      >
        Submit
      </button>
    </form>
  );
}
