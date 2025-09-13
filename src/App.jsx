import React from 'react';
import logo from './assets/logo.jpg';
import ViewsCounter from './components/ViewsCounter';
import Login from "./pages/Login";

export default function App() {
  return (
    <div className="page" /* 整頁骨架：背景色、垂直布局 */>
      {/* 左上角放名稱 */}
      <header className="header">
        <div className="brand">OrderPeek</div>
      </header>

      {/* 中央 */}
      <main className="main">
        <section className="card" aria-label="Login card">
          {/* 圓形 LOGO 區（圖檔放 public/logo.png） */}
          <div className="logoWrap">
            <img className="logo" src={logo} alt="OrderPeek Logo" />
          </div>

          {/* 標語 */}
          <p className="tagline">1370 幫你買 | 中日韓動漫代購</p>

          {/* 登入表單 (抽出元件) */}
          <Login />
        </section>
      </main>

      {/* 底部瀏覽統計（先前端，日後改後端真數據） */}
      <footer className="footer">
        <ViewsCounter className="views" />
      </footer>
    </div>
  );
}
