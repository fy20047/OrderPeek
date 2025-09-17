import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";

export default function ColumnPickerModal({
  open,
  onClose,
  headers = [],
  rows = [], // 原始資料列，每列都是物件
  initialSelected = [], // 預設勾選的欄位清單
  onSave, // 儲存結果的回呼函式
  displayName,
}) {
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [error, setError] = useState("");
  const label = (h) => (displayName ? displayName(h) : h);

  useEffect(() => {
    setSelected(new Set(initialSelected));
    setError("");
  }, [open, initialSelected]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]); // 預覽前 5 筆資料

  if (!open) return null;

  function toggle(field) {
    const next = new Set(selected);
    next.has(field) ? next.delete(field) : next.add(field);
    setSelected(next);
  }

  function selectAll() {
    setSelected(new Set(headers));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleSave() {
    if (selected.size === 0) {
      setError("請至少勾選一個欄位");
      return;
    }
    onSave(Array.from(selected));
  }

  return (
    <div style={backdropStyle}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="欄位挑選">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, flex: 1 }}>選擇要公開的欄位</h3>
          <button className="logoutBtn" onClick={onClose}>取消</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <button className="logoutBtn" type="button" onClick={selectAll}>全選</button>
              <button className="logoutBtn" type="button" onClick={clearAll}>全部清除</button>
            </div>

            {/* 欄位清單，可捲動瀏覽 */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 8,
                background: "#fff",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                maxHeight: "220px", // 超過高度時出現捲軸
                overflowY: "auto",
              }}
            >
              {headers.map((h) => (
                <label key={h} style={chipStyle}>
                  <input
                    type="checkbox"
                    checked={selected.has(h)}
                    onChange={() => toggle(h)}
                    style={{ marginRight: 6 }}
                  />
                  {label(h)}
                </label>
              ))}
            </div>
          </div>

          {/* 欄位預覽，協助確認資料內容 */}
          <div>
            <div style={{ fontWeight: 600, margin: "8px 0" }}>資料預覽（最多 5 筆）</div>
            <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
              <table style={{ borderCollapse: "collapse", minWidth: "max-content" }}>
                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    {headers.filter((h) => selected.has(h)).map((h) => (
                      <th key={h} style={cellTh}>{label(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {headers.filter((h) => selected.has(h)).map((h) => (
                        <td key={h} style={cellTd}>
                          {row?.[h] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="logoutBtn" type="button" onClick={onClose}>取消</button>
            <button className="logoutBtn" type="button" onClick={handleSave}>儲存欄位</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const modalStyle = {
  width: "min(1200px, 100%)",
  maxHeight: "85vh",        // 限制視窗高度以避免內容溢出
  overflow: "auto",         // 內容高度超過時可以滾動
  background: "var(--card-bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid var(--border)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 14,
  background: "#fff",
};

const cellTh = { border: "1px solid #ddd", padding: "8px", textAlign: "left", whiteSpace: "nowrap" };
const cellTd = { border: "1px solid #ddd", padding: "8px", whiteSpace: "nowrap" };
