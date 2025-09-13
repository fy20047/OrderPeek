import React, { useState } from "react";
import { apiUrl } from "../config"; // 統一管理 API 基底網址（見 src/config.js）
import { useNavigate } from "react-router-dom"; // react-router 的官方方式，不會整頁 reload
import ErrorMessage from "../components/ErrorMessage.jsx";
import { setRole } from "../lib/auth.js";

export default function Login() {
  // 受控元件用的狀態（帳號 / 密碼）
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 錯誤訊息：登入失敗或網路錯誤時顯示
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  /**
   * 送出登入表單：
   * - 目前先阻止預設行為 + console.log
   * - 後續會改成 fetch('/api/auth/login', ...) 打後端
   * - 成功後依角色導向 /admin 或 /app
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 避免連點
    // TODO: 換成真 API
    // 範例（之後開後端時直接把註解拿掉）：
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ account, password }),
    //   credentials: 'include', // 若用 Cookie-based auth
    // });
    // const data = await res.json();
    // if (res.ok) {
    //   if (data.role === 'ADMIN') location.href = '/admin';
    //   else location.href = '/app';
    // } else {
    //   alert(data.message || '登入失敗');
    // }

    // 清空上一輪錯誤並呼叫後端登入 API
    setError("");
    setLoading(true); // 送出前設為 true

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
        // 若改為 Cookie/Session 驗證，開啟下行並調整後端 CORS：
        // credentials: 'include',
      });

      const text = await res.text(); // 後端可能回傳非 JSON，保險處理避免拋錯
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (res.ok && data?.role) {
        setRole(data.role); // 記住角色，讓路由守門可判斷
        // alert(`登入成功，角色：${data.role || 'UNKNOWN'}`);
        // 成功 → 依角色跳轉
        if (data.role === "ADMIN") {
          nav("/admin", { replace: true });
        } else if (data.role === "USER") {
          nav("/app", { replace: true });
        } else {
          setError(`登入成功，但角色未知：${data.role}`);
        }
      } else {
        // 失敗 → 顯示後端錯誤訊息
        setError(data.message || "登入失敗");
      }
    } catch {
      setError("無法連線到伺服器");
    } finally {
      setLoading(false); // 無論成功失敗都關閉 loading
    }
  };
  
  /**
   * 鍵盤：
   * - input 已經是表單的一部分，按 Enter 會觸發 onSubmit
   * - label.htmlFor 對應 input.id，提升無障礙體驗
   * - autoComplete="username"/"current-password" 讓瀏覽器能記住
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

      {/* {error && (
        <div className="error" role="alert" aria-live="polite">
          {error}
        </div>
      )} */}
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
          if (ripple) {
            ripple.remove();
          }
          btn.appendChild(circle);
        }}
      >
        Submit
      </button>
    </form>
  );
}
