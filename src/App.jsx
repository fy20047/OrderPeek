import React, { useEffect, useState } from 'react';
import logo from './assets/logo.jpg';

export default function App() {
  // 受控元件用的狀態（帳號 / 密碼）
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  // 頁面底部的瀏覽統計（先用 localStorage 模擬，之後會換後端）
  const [todayViews, setTodayViews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  /**
   載入時做瀏覽次數統計：
   - 用 localStorage 儲存「今日日期」、「今日計數」、「總計數」
   - 用 sessionStorage 確保「同一個分頁只加一次」，避免 F5 狂加
   key 命名：
   - op_visit_date：YYYY-MM-DD
   - op_visit_today：今日計數
   - op_visit_total：總計數
   - op_session_counted：此分頁是否已經計過
   */
  useEffect(() => {
    const todayKey = 'op_visit_date';
    const todayCountKey = 'op_visit_today';
    const totalKey = 'op_visit_total';
    const sessionFlag = 'op_session_counted';

    const todayStr = new Date().toISOString().slice(0, 10); // 例如 "2025-09-12"
    const storedDay = localStorage.getItem(todayKey);

    // 跨日就重置今日計數
    if (storedDay !== todayStr) {
      localStorage.setItem(todayKey, todayStr);
      localStorage.setItem(todayCountKey, '0');
    }
    // 初始化總計
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

    // useState 觸發畫面更新
    setTodayViews(parseInt(localStorage.getItem(todayCountKey) || '0', 10));
    setTotalViews(parseInt(localStorage.getItem(totalKey) || '0', 10));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('login submit', { account, password });
  };

  return (
    <div className="page" /* 整頁骨架：背景色、垂直布局 */>
      {/* 左上角放名稱 */}
      <header className="header">
        <div className="brand">OrderPeek</div>
      </header>

      {/* 中央 */}
      <main className="main">
        <section className="card" aria-label="Login card">
          {/* 圓形 LOGO 區 */}
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

      {/* 瀏覽統計（日後改後端真數據） */}
      <footer className="footer">
        <div className="views" aria-live="polite">
          今日：{todayViews}　|　累計：{totalViews}
        </div>
      </footer>
    </div>
  );
}
