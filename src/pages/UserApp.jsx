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
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "../components/LogoutButton.jsx";
import { loadPublished } from "../lib/publish.js";

export default function UserApp() {
  const [published, setPublished] = useState(null); // { visibleFields, rows, ts } 或 null
  const [q, setQ] = useState(""); // 簡單關鍵字搜尋

  useEffect(() => {
    setPublished(loadPublished());
  }, []);

  const visibleFields = published?.visibleFields || [];
  const rows = published?.rows || [];

  // 簡單關鍵字過濾（任何欄位含有關鍵字就顯示）
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const kw = q.trim().toLowerCase();
    return rows.filter((r) =>
      visibleFields.some((f) => String(r?.[f] ?? "").toLowerCase().includes(kw))
    );
  }, [rows, visibleFields, q]);

  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 使用者介面</div>
        <LogoutButton /> {/* 右上角登出 */}
      </header>

      <main className="main">
        <section className="card card-wide" aria-label="User card">
          <h2 style={{ marginTop: 0 }}>我的訂單</h2>

          {!published ? (
            <EmptyState />
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  className="input"
                  style={{ maxWidth: 280 }}
                  placeholder="搜尋關鍵字"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <div style={{ fontSize: 12, opacity: 0.7, marginLeft: "auto" }}>
                  最後更新：{new Date(published.ts).toLocaleString()}
                </div>
              </div>

              <div className="tableScroll" style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f8f8" }}>
                      {visibleFields.map((h) => (
                        <th key={h} style={thCell}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={visibleFields.length} style={{ textAlign: "center" }}>
                          沒有符合條件的資料
                        </td>
                      </tr>
                    ) : (
                      filtered.slice(0, 200).map((row, idx) => (
                        <tr key={idx}>
                          {visibleFields.map((h) => (
                            <td key={h} style={tdCell}>{row?.[h] ?? ""}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "16px",
      border: "1px dashed var(--border)",
      borderRadius: 12,
      background: "#fff",
      color: "var(--fg)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>尚未發佈資料</div>
      <div style={{ fontSize: 14, opacity: 0.8 }}>
        請聯絡管理員發佈最新資料，或稍後再試。
      </div>
    </div>
  );
}

const thCell = { border: "1px solid #ddd", padding: "8px", textAlign: "left", whiteSpace: "nowrap" };
const tdCell = { border: "1px solid #ddd", padding: "8px" };