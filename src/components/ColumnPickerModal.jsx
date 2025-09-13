// src/components/ColumnPickerModal.jsx
import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";

export default function ColumnPickerModal({
  open,
  onClose,
  headers = [],
  rows = [],           // 解析出的列資料（每列為物件）
  initialSelected = [],// 預設勾選欄位
  onSave,              // (selectedFields) => void
}) {
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(new Set(initialSelected));
    setError("");
  }, [open, initialSelected]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]); // 只預覽前5列

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
      setError("請至少選擇一個欄位");
      return;
    }
    onSave(Array.from(selected));
  }

  return (
    <div style={backdropStyle}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="欄位挑選">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, flex: 1 }}>選擇要公開的欄位</h3>
          <button className="logoutBtn" onClick={onClose}>關閉</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="logoutBtn" type="button" onClick={selectAll}>全選</button>
              <button className="logoutBtn" type="button" onClick={clearAll}>全不選</button>
            </div>

            {/* 欄位清單（可換行 + 可捲動） */}
            <div
                style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 8,
                background: "#fff",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                maxHeight: "220px",      // 超過就出現卷軸
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
                  {h}
                </label>
              ))}
            </div>
          </div>

          {/* 預覽表（跟著選到的欄位顯示） */}
          <div>
            <div style={{ fontWeight: 600, margin: "8px 0" }}>資料預覽（前 5 列）</div>
            <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    {headers.filter(h => selected.has(h)).map((h) => (
                      <th key={h} style={cellTh}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {headers.filter(h => selected.has(h)).map((h) => (
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
  width: "min(920px, 100%)",
  maxHeight: "85vh",        // 視窗本身也限制高度避免溢出
  overflow: "auto",         // 視窗內可捲動
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

const cellTh = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
const cellTd = { border: "1px solid #ddd", padding: "8px" };
