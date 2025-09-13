// import LogoutButton from "../components/LogoutButton.jsx";

// export default function UserApp() {
//   return (
//     <div style={{ padding: "2rem" }}>
//       <header style={{ display: "flex", alignItems: "center" }}>
//         <h1 style={{ flex: 1 }}>使用者頁面</h1>
//         <LogoutButton /> {/* 右上角登出 */}
//       </header>
//       <p>這裡之後會放使用者功能。</p>
//     </div>
//   );
// }

import LogoutButton from "../components/LogoutButton.jsx";

export default function UserApp() {
  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 使用者介面</div>
        <LogoutButton /> {/* 右上角登出 */}
      </header>

      <main className="main">
        <section className="card" aria-label="User card">
          <h2>我的訂單</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>商品名稱</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>數量</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>測試商品 A</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>2</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>500</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>測試商品 B</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>1</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>300</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
