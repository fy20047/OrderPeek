// src/shared/components/ColumnPickerModal.jsx
import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";

export default function ColumnPickerModal({
  open,
  onClose,
  headers = [],
  rows = [],
  initialSelected = [],
  onSave,
  displayName,
}) {
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [error, setError] = useState("");
  const label = (h) => (displayName ? displayName(h) : h);

  useEffect(() => {
    setSelected(new Set(initialSelected));
    setError("");
  }, [open, initialSelected]);

  // 鎖住背景頁捲動
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);
  const selectedHeaders = useMemo(() => headers.filter((h) => selected.has(h)), [headers, selected]);

  const baseWidths = useMemo(() => {
    return selectedHeaders.map((h) => {
      const texts = [label(h), ...previewRows.map((row) => String(row?.[h] ?? ""))];
      const maxLen = Math.max(1, ...texts.map((t) => t.length));
      return Math.max(80, Math.round(maxLen * 12));
    });
  }, [selectedHeaders, previewRows, label]);

  const totalBasePx = baseWidths.reduce((a, b) => a + b, 0);
  const pct = 100 / Math.max(1, selectedHeaders.length);

  if (!open) return null;

  function toggle(field) {
    const next = new Set(selected);
    next.has(field) ? next.delete(field) : next.add(field);
    setSelected(next);
  }
  function selectAll() { setSelected(new Set(headers)); }
  function clearAll() { setSelected(new Set()); }
  function handleSave() {
    if (selected.size === 0) { setError("請至少勾選一個欄位"); return; }
    onSave(Array.from(selected));
  }

  // 兩行 chips 的高度（可依實際 UI 微調）
  const CHIP_ROW = 44;
  const CHIP_GAP = 8;
  const CHIP_MAX_H = CHIP_ROW * 2 + CHIP_GAP;

  return (
    <div style={backdropStyle}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="欄位挑選">
        {/* 頂部列：確保不超出 modal 寬 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12, minWidth: 0, maxWidth: "100%" }}>
          <h3 style={{ margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>選擇要公開的欄位</h3>
          <button className="logoutBtn" onClick={onClose}>取消</button>
        </div>

        {/* 內容 Grid：以及所有直接子容器都設 minWidth:0 以避免撐破 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, minWidth: 0, maxWidth: "100%" }}>
          
          {/* 勾選區包裹層（避免撐破） */}
          <div style={{ minWidth: 0, maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, minWidth: 0, maxWidth: "100%"}}>
              <div style={{ flex: 1 }} />
              <button className="logoutBtn" type="button" onClick={selectAll}>全選</button>
              <button className="logoutBtn" type="button" onClick={clearAll}>全部清除</button>
            </div>

            {/* ✅ 勾選清單：最多 2 行；超出使用自身垂直卷軸；不可超出 modal 寬 */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 8,
                background: "#fff",
                display: "flex",
                flexWrap: "wrap",
                gap: CHIP_GAP,
                width: "100%",
                whiteSpace: "normal",
                maxHeight: CHIP_MAX_H,
                overflowY: "auto",
                overflowX: "hidden",
                overscrollBehavior: "contain",
                minWidth: 0,          // 🔑 防止在 grid/flex 中撐破寬度
                maxWidth: "100%",     // 🔑 不得超過 modal 內容寬
                alignContent: "start" // 讓兩行的行高計算更穩定
                
              }}
            >
              {headers.map((h, i) => (
                <label key={`chip:${i}:${h}`} style={chipStyle}>
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

          {/* 預覽表格包裹層（避免撐破） */}
          <div style={{ minWidth: 0, maxWidth: "100%" }}>
            <div style={{ fontWeight: 600, margin: "8px 0" }}>資料預覽（最多 5 筆）</div>

            {/* ✅ Excel 預覽：不可超過 modal 寬；只顯示「水平」卷軸 */}
            <div
              className="tableScroll"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                minWidth: 0,          // 🔑 允許縮小，不要撐破
                maxWidth: "100%",     // 🔑 限制於 modal 寬
                overflowX: "auto",    // ✅ 只開水平捲
                overflowY: "hidden",  // ✅ 關掉垂直捲
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch", // 滑順（行動裝置）
                display: "block"      // 確保可計算滾動盒
              }}
            >
              <table
                style={{
                  width: "max-content",        // ✅ 依內容撐寬，超出才出水平捲
                  minWidth: `${totalBasePx}px`,
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  whiteSpace: "nowrap",
                }}
              >
                <colgroup>
                  {baseWidths.map((w, i) => (
                    <col key={`col:${i}`} style={{ width: `max(${pct}%, ${w}px)` }} />
                  ))}
                </colgroup>

                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    {selectedHeaders.map((h, i) => (
                      <th key={`th:${i}:${h}`} style={cellTh}>{label(h)}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {previewRows.map((row, rIdx) => (
                    <tr key={`tr:${rIdx}`}>
                      {selectedHeaders.map((h, cIdx) => (
                        <td key={`td:${rIdx}:${cIdx}:${h}`} style={cellTd}>
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

          {/* 底部按鈕列：也避免撐破 */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", minWidth: 0, maxWidth: "100%" }}>
            
            <button className="logoutBtn" type="button" onClick={handleSave}>儲存欄位</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== 樣式 ====== */

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
  width: "min(1200px, 96vw)",
  maxHeight: "85vh",
  overflowY: "auto",   // Modal 只允許垂直捲動
  overflowX: "hidden", // 禁止水平捲動
  background: "var(--card-bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  boxSizing: "border-box", // 🔑 避免 padding 撐出寬度
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid var(--border)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 14,
  background: "#fff",
  lineHeight: "1.2",
};

const cellTh = {
  border: "1px solid #ddd",
  padding: "8px 12px",
  textAlign: "left",
  whiteSpace: "nowrap",
  lineHeight: 1.5,
};

const cellTd = {
  border: "1px solid #ddd",
  padding: "8px 12px",
  whiteSpace: "nowrap",
  lineHeight: 1.5,
};
