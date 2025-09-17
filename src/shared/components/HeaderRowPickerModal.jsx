import React, { useEffect, useMemo, useState } from "react";

export default function HeaderRowPickerModal({
  open,
  onClose,
  grid = [],
  initialRow = 0,
  onSave,
  fitByRow = false,
}) {
  if (!open) return null;

  const [sel, setSel] = useState(initialRow ?? 0);
  useEffect(() => { setSel(initialRow ?? 0); }, [initialRow, open]);

  // === A) 以「前10列」估欄寬（單位：ch），同時算出總寬 ===
  const HEADER_MEASURE_ROWS = 10;
  const { colCh, totalCh } = useMemo(() => {
    const rowsA = grid.slice(0, HEADER_MEASURE_ROWS);
    const rows = grid[sel] ? [...rowsA, grid[sel]] : rowsA;
    const colCount = rows.reduce((m, r) => Math.max(m, (r?.length ?? 0)), 0);
    const maxLen = new Array(colCount).fill(0);
    rows.forEach((r) => {
      for (let i = 0; i < colCount; i++) {
        const txt = String(r?.[i] ?? "");
        maxLen[i] = Math.max(maxLen[i], txt.length);
      }
    });
    // 每欄最小寬：max(6em, (最大字數 + 2)em)
    const colCh = maxLen.map((n) => Math.max(6, n + 2));
    const totalCh = colCh.reduce((a, b) => a + b, 0);
    return { colCh, totalCh };
  }, [grid, sel]);

  const overlay = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "rgba(0,0,0,0.35)", zIndex: 9999,
  };
  const panel = {
    width: "min(1200px, 96vw)", maxHeight: "85vh",
    display: "flex", flexDirection: "column",
    background: "var(--card-bg)", border: "1px solid var(--border)",
    borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  };
  const scroller = {
    padding: 12, overflowX: "auto", overflowY: "auto", width: "100%",
  };

  // === B) grid 的欄定義：minmax(你算的寬, 1fr) → 可拉寬、不可小於最小寬 ===
  const templateForRow = (row) => {
    if (fitByRow) {
      const n = row?.length ?? 0;
      // 下限固定、上限用 1fr：多出的寬度會平均分配到每欄
      return `repeat(${n}, minmax(6ch, 1fr))`;
    }
    // 依前10列估出每欄最小寬，空間多時用 1fr 平均拉寬
    const cols = colCh.map((n) => `minmax(${n}ch, 1fr)`);
    return cols.join(" ");
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          選擇哪一列作為欄位標題
        </div>

        <div style={scroller}>
          {/* 
             C) 表格至少要有 Σ欄寬 + 列號寬(64px) 這麼寬，否則會壓縮。
             width:100% 讓「不足容器時」自動拉寬吃滿；超過則靠 overflowX 產生水平捲動。
          */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: `calc(${totalCh}ch + 64px)`,
            }}
          >
            <colgroup>
              <col style={{ width: "64px" }} />
              <col />
            </colgroup>

            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky", left: 0, zIndex: 1,
                    background: "#fafafa", border: "1px solid #ddd",
                    padding: "6px 8px", textAlign: "left", whiteSpace: "nowrap",
                  }}
                >
                  列
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px 8px", textAlign: "left" }}>
                  內容（前幾欄預覽）
                </th>
              </tr>
            </thead>

            <tbody>
              {grid.slice(0, 10).map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => setSel(rIdx)}
                  style={{ cursor: "pointer", background: sel === rIdx ? "rgba(88,50,37,0.08)" : "transparent" }}
                >
                  <td
                    style={{
                      position: "sticky", left: 0, zIndex: 1, background: "#fafafa",
                      border: "1px solid #ddd", padding: "6px 8px", whiteSpace: "nowrap",
                    }}
                  >
                    {rIdx + 1}{sel === rIdx ? " ★" : ""}
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: 0 }}>
                    {/* D) 內層 grid：寬度 100% + minmax 欄位；cell 要能省略號 */}
                    <div
                      style={{
                        width: "100%",
                        display: "grid",
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
                            overflow: "visible",   // 不裁切，讓內容撐開欄位；超出整體寬度時由外層 scroller 產生水平卷軸   
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

          <p style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
            顯示前 10 列供選擇；實際解析時會使用你指定的那一列。
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: 12, borderTop: "1px solid var(--border)" }}>
          <button className="logoutBtn" onClick={onClose}>取消</button>
          <button className="logoutBtn" onClick={() => onSave(sel)}>使用第 {sel + 1} 列</button>
        </div>
      </div>
    </div>
  );
}
