import React, { useEffect, useState } from 'react';
import logo from './assets/logo.jpg';
// 統一管理 API 基底網址（見 src/config.js）
import { apiUrl } from './config';

export default function App() {
  // 受控元件用的狀態（帳號 / 密碼）
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  // 錯誤訊息：登入失敗或網路錯誤時顯示
  const [error, setError] = useState('');

  // 頁面底部的瀏覽統計（先用 localStorage 模擬，之後會換後端）
  const [todayViews, setTodayViews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  /**
   * 首頁載入時做瀏覽次數統計：
   * - 用 localStorage 儲存「今日日期」、「今日計數」、「總計數」
   * - 用 sessionStorage 確保「同一個分頁只加一次」，避免 F5 狂加
   *
   * key 命名：
   * - op_visit_date：YYYY-MM-DD
   * - op_visit_today：今日計數
   * - op_visit_total：總計數
   * - op_session_counted：此分頁是否已經計過
   */
  useEffect(() => {
    const todayKey = 'op_visit_date';
    const todayCountKey = 'op_visit_today';
    const totalKey = 'op_visit_total';
    const sessionFlag = 'op_session_counted';

    const todayStr = new Date().toISOString().slice(0, 10); // 例如 "2025-09-12"
    const storedDay = localStorage.getItem(todayKey);

    // 跨日就重置「今日計數」
    if (storedDay !== todayStr) {
      localStorage.setItem(todayKey, todayStr);
      localStorage.setItem(todayCountKey, '0');
    }
    // 首次使用者（或清庫後）初始化總計
    if (!localStorage.getItem(totalKey)) {
      localStorage.setItem(totalKey, '0');
    }

    // 一個分頁只加一次統計
    if (!sessionStorage.getItem(sessionFlag)) {
      const t = parseInt(localStorage.getItem(totalKey) || '0', 10) + 1;
      localStorage.setItem(totalKey, String(t));

      const d = parseInt(localStorage.getItem(todayCountKey) || '0', 10) + 1;
      localStorage.setItem(todayCountKey, String(d));

      sessionStorage.setItem(sessionFlag, '1');
    }

    // 映射到狀態以觸發畫面更新
    setTodayViews(parseInt(localStorage.getItem(todayCountKey) || '0', 10));
    setTotalViews(parseInt(localStorage.getItem(totalKey) || '0', 10));
  }, []);

  /**
   * 送出登入表單：
   * - 目前先阻止預設行為 + console.log
   * - 後續會改成 fetch('/api/auth/login', ...) 打後端
   * - 成功後依角色導向 /admin 或 /app
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
 
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
    setError('');
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
        // 若未來改為 Cookie/Session 驗證，請開啟下行並調整後端 CORS：
        // credentials: 'include',
      });

      // 後端可能回傳非 JSON，保險處理避免拋錯
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) {}

      if (res.ok) {
        alert(`登入成功，角色：${data.role || 'UNKNOWN'}`);
        // 之後再導頁：
        // if (data.role === 'ADMIN') location.href = '/admin';
        // else location.href = '/app';
      } else {
        setError(data.message || '登入失敗');
      }
    } catch (_) {
      setError('無法連線到伺服器');
    }
  };

  /**
   * 鍵盤可用性：
   * - input 已經是表單的一部分，按 Enter 會觸發 onSubmit
   * - label.htmlFor 對應 input.id，提升無障礙體驗
   * - autoComplete="username"/"current-password" 讓瀏覽器能記住
   */

  return (
    <div className="page" /* 整頁骨架：背景色、垂直布局 */>
      {/* 左上角放名稱 */}
      <header className="header">
        <div className="brand">OrderPeek</div>
      </header>

      {/* 中央 */}
      <main className="main">
        <section className="card" aria-label="Login card">
          {/* 圓形 LOGO 區（圖檔請放 public/logo.png） */}
          <div className="logoWrap">
            <img className="logo" src={logo} alt="OrderPeek Logo" />
          </div>

          {/* 標語 */}
          <p className="tagline">1370 幫你買 | 中日韓動漫代購</p>

          {/* 登入表單 */}
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

            {/* 錯誤訊息（有錯誤時顯示） */}
            {error && (
              <div className="error" role="alert" aria-live="polite">{error}</div>
            )}

            <button
              className="submitBtn"
              type="submit"
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
        </section>
      </main>

      {/* 底部瀏覽統計（先前端，日後改後端真數據） */}
      <footer className="footer">
        <div className="views" aria-live="polite">
          今日：{todayViews}　|　累計：{totalViews}
        </div>
      </footer>
    </div>
  );
}
