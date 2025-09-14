import React, { useEffect, useMemo, useState } from "react";

/**
 * HeaderRowPickerModal
 * - fitByRow=true  → 每一列用「該列內容」動態欄寬（你現在想要的）
 * - fitByRow=false → 全表對齊欄寬（每欄依整體最長估寬）
 */
export default function HeaderRowPickerModal({
  open,
  onClose,
  grid = [],
  initialRow = 0,
  onSave,
  fitByRow = false, // 預設改為「全表一致欄寬」避免跑版
}) {
  // 先檢查 open，避免 hooks 順序改變
  if (!open) return null;

  const [sel, setSel] = useState(initialRow ?? 0);
  useEffect(() => { setSel(initialRow ?? 0); }, [initialRow, open]);

  const HEADER_MEASURE_ROWS = 80;
  // 給「全表對齊」用的欄寬（fitByRow=false 才會用到）
  const colWidths = useMemo(() => {
    const rows = grid.slice(0, HEADER_MEASURE_ROWS);
    const colCount = rows.reduce((m, r) => Math.max(m, (r?.length ?? 0)), 0);
    const maxLen = new Array(colCount).fill(0);
    rows.forEach(r => {
      for (let i = 0; i < colCount; i++) {
        const txt = String(r?.[i] ?? "");
        maxLen[i] = Math.max(maxLen[i], txt.length);
      }
    });
    // 以字數估 ch 寬度：介於 6ch ~ 20ch
    return maxLen.map(n => `${Math.max(6, Math.min(20, n + 2))}ch`);
  }, [grid]);

  const overlay = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "rgba(0,0,0,0.35)", zIndex: 9999,
  };
  const panel = {
    width: "min(1200px, 96vw)", maxHeight: "85vh",
    display: "flex", flexDirection: "column",
    background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  };
  const scroller = { overflowX: "auto", overflowY: "auto", padding: 12 };

  const templateForRow = (row) =>
    fitByRow
      ? `repeat(${row?.length ?? 0}, max-content)` // 每列動態欄寬
      : colWidths.join(" ");                        // 或使用全表一致欄寬

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          選擇哪一列當作「標題列」
        </div>

        <div style={scroller}>
          <table style={{ borderCollapse: "collapse", minWidth: "max-content" }}>
            <thead>
              <tr>
                <th style={{ position:"sticky", left:0, background:"#fafafa", border:"1px solid #ddd", padding:"6px 8px" }}>列號</th>
                <th style={{ border:"1px solid #ddd", padding:"6px 8px" }}>內容（點擊某一列以選取）</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const HEADER_PREVIEW_ROWS = 20;   // 明確固定顯示前 20 列
                return grid.slice(0, HEADER_PREVIEW_ROWS);
              })().map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => setSel(rIdx)}
                  style={{ cursor: "pointer", background: sel === rIdx ? "rgba(88,50,37,0.08)" : "transparent" }}
                >
                  <td style={{ position:"sticky", left:0, background:"#fafafa", border:"1px solid #ddd", padding:"6px 8px", whiteSpace:"nowrap" }}>
                    {rIdx + 1}{sel === rIdx ? " ★" : ""}
                  </td>
                  <td style={{ border:"1px solid #ddd", padding:0 }}>
                    {/* 使用共同欄寬模板避免跑版（fitByRow=false） */}
                    <div
                      style={{
                        display: "grid",
                        gridAutoFlow: "column",
                        gridAutoColumns: "max-content",
                        gridTemplateColumns: templateForRow(row),
                      }}
                    >
                      {row.map((cell, i) => (
                        <div
                          key={i}
                          style={{
                            borderRight: i === row.length - 1 ? "none" : "1px solid #eee",
                            padding: "6px 8px",
                            whiteSpace: "nowrap",
                            maxWidth: "20ch",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={String(cell ?? "")}
                        >
                          {String(cell ?? "")}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ opacity:.7, fontSize:12, marginTop:8 }}>
            ※ 顯示前 120 列供選擇；實際解析會用你選的那一列。
          </p>
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", padding:12, borderTop:"1px solid var(--border)" }}>
          <button className="logoutBtn" onClick={onClose}>取消</button>
          <button className="logoutBtn" onClick={() => onSave(sel)}>
            使用第 {sel + 1} 列
          </button>
        </div>
      </div>
    </div>
  );
}
