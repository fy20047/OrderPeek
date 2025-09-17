import React from "react";
import logo from "./assets/logo.jpg";
import ViewsCounter from "@/shared/components/ViewsCounter.jsx";
import Login from "./pages/Login";

export default function App() {
  return (
    <div className="page">
      {/* 上方品牌名稱 */}
      <header className="header">
        <div className="brand">OrderPeek</div>
      </header>

      {/* 中央登入卡片 */}
      <main className="main">
        <section className="card" aria-label="Login card">
          {/* 圓形 LOGO（影像檔位於 public/logo.png） */}
          <div className="logoWrap">
            <img className="logo" src={logo} alt="OrderPeek Logo" />
          </div>

          {/* 標語 */}
          <p className="tagline">1370 幫你搞定｜中日動漫代購</p>

          {/* 登入表單 */}
          <Login />
        </section>
      </main>

      {/* 底部瀏覽統計（目前為前端暫存） */}
      <footer className="footer">
        <ViewsCounter className="views" />
      </footer>
    </div>
  );
}
