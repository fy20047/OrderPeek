// import { logout } from "../lib/auth.js";
// import { useNavigate } from "react-router-dom";
// import LogoutButton from "../components/LogoutButton.jsx";

// export default function Admin() {
//   const nav = useNavigate();
//   return (
//     <div style={{ padding: "1rem" }}>
//       <header style={{ display: "flex", alignItems: "center" }}>
//         <h1 style={{ flex: 1 }}>管理員頁面</h1>
//         <LogoutButton /> {/* 右上角登出 */}
//       </header>
//       <p>這裡之後會放管理員功能。</p>
//     </div>
//   );
// }

import LogoutButton from "../components/LogoutButton.jsx";

export default function Admin() {
  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 管理員後台</div>
        <LogoutButton /> {/* 右上角登出 */}
      </header>

      <main className="main">
        <section className="card" aria-label="Admin card">
          <h2>上傳 Excel 檔案</h2>
          <input
            type="file"
            accept=".xlsx"
            style={{ marginTop: "12px", marginBottom: "12px" }}
          />
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            （這裡之後會顯示欄位清單，管理者可勾選要公開的欄位）
          </p>
        </section>
      </main>
    </div>
  );
}

