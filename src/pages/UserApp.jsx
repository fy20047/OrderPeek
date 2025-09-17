import LogoutButton from "@/shared/components/LogoutButton.jsx";
import { loadPublished } from "@/features/publish/api.js";
import { useEffect, useMemo, useState } from "react";

export default function UserApp() {
  const [published, setPublished] = useState(null); // { visibleFields, rows, ts } 或 null
  const [q, setQ] = useState(""); // 簡易關鍵字搜尋

  useEffect(() => {
    const update = () => setPublished(loadPublished());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("op:published", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("op:published", update);
    };
  }, []);

  const visibleFields = published?.visibleFields || [];
  const rows = published?.rows || [];

  // 只要任一欄包含關鍵字就顯示該列
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
        <div className="brand" style={{ flex: 1 }}>OrderPeek 使用者頁面</div>
        <LogoutButton />
      </header>

      <main className="main">
        <section className="card card-wide" aria-label="User card">
          <h2 style={{ marginTop: 0 }}>最新發布的訂單資料</h2>

          {!published ? (
            <EmptyState />
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  className="input"
                  style={{ maxWidth: 280 }}
                  placeholder="輸入關鍵字搜尋"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <div style={{ fontSize: 12, opacity: 0.7, marginLeft: "auto" }}>
                  最後更新：{published?.ts ? new Date(published.ts).toLocaleString() : "-"}
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
      <div style={{ fontWeight: 600, marginBottom: 6 }}>尚未發布資料</div>
      <div style={{ fontSize: 14, opacity: 0.8 }}>
        請聯絡管理員，確認是否已在後台發布最新資料。
      </div>
    </div>
  );
}

const thCell = { border: "1px solid #ddd", padding: "8px", textAlign: "left", whiteSpace: "nowrap" };
const tdCell = { border: "1px solid #ddd", padding: "8px" };
