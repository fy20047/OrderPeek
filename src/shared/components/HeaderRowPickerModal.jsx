import React, { useEffect, useMemo, useState } from "react";

export default function HeaderRowPickerModal({
  open,
  onClose,
  grid = [],
  initialRow = 0,
  onSave,
  fitByRow = false,
}) {
  // ===== state / effects =====
  const [sel, setSel] = useState(initialRow ?? 0);
  useEffect(() => { setSel(initialRow ?? 0); }, [initialRow, open]);

  // ===== 測字寬 =====
  function measureTextWidthPx(text, font = "14px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial") {
    const c = measureTextWidthPx._c || (measureTextWidthPx._c = document.createElement("canvas"));
    const ctx = c.getContext("2d");
    ctx.font = font;
    return Math.ceil(ctx.measureText(String(text ?? "")).width);
  }

  // ===== 估算欄寬（以前 10 列 + 目前選列）=====
  const CELL_PAD_X = 16;     // 兩側 padding 合計
  const CELL_MIN_PX = 56;
  const HEADER_MEASURE_ROWS = 10;
  const CELL_GUTTER_PX = 12;

  const { colPx, totalPx } = useMemo(() => {
    const baseRows = grid.slice(0, HEADER_MEASURE_ROWS);
    const rows = grid[sel] ? [...baseRows, grid[sel]] : baseRows;
    const colCount = rows.reduce((m, r) => Math.max(m, r?.length ?? 0), 0);
    const maxPx = Array(colCount).fill(0);
    const font = "14px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial";

    rows.forEach((r) => {
      for (let i = 0; i < colCount; i++) {
        const w = measureTextWidthPx(r?.[i] ?? "", font) + CELL_PAD_X + CELL_GUTTER_PX;
        if (w > maxPx[i]) maxPx[i] = w;
      }
    });

    const colPx = maxPx.map((w) => Math.max(w, CELL_MIN_PX));
    const totalPx = colPx.reduce((a, b) => a + b, 0);
    return { colPx, totalPx };
  }, [grid, sel]);

  // 把每欄寬度固定為像素，確保整體表寬 = 64px(左欄) + Σ欄寬
  const templatePxForRow = (row) => {
    if (fitByRow) {
      const n = row?.length ?? 0;
      return `repeat(${n}, ${CELL_MIN_PX}px)`;
    }
    return colPx.map((px) => `${px}px`).join(" ");
  };

  if (!open) return null;

  // ===== 外層樣式 =====
  const overlay = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "rgba(0,0,0,0.35)", zIndex: 9999,
  };
  const panel = {
    width: "min(1200px, 96vw)", maxHeight: "85vh",
    display: "flex", flexDirection: "column",
    background: "var(--card-bg)", border: "1px solid var(--border)",
    borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    overflowX: "hidden", // 🔒 面板不出水平捲軸
  };
  // 整體內容只垂直滾；水平交給下面 hScroller
  const verticalScroller = {
    padding: 12,
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
    minWidth: 0,
  };
  // 唯一的水平捲軸：包住整張 table
  const hScroller = {
    overflowX: "auto",
    overflowY: "hidden",
    width: "100%",
    minWidth: 0,
    WebkitOverflowScrolling: "touch",
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
          選擇哪一列作為欄位標題
        </div>

        {/* 垂直滾容器 */}
        <div style={verticalScroller}>
          {/* ⬇️ 單一水平捲軸，包住整張表 */}
          <div style={hScroller}>
            <table
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",    // 依 colgroup 分配寬度
                width: `calc(64px + ${totalPx}px)`, // 🔑 強制表格總寬（使其可水平滾）
                minWidth: `calc(64px + ${totalPx}px)`,
              }}
            >
              <colgroup>
                <col style={{ width: "64px" }} />  {/* 列號固定寬 */}
                <col style={{ width: `${totalPx}px` }} /> {/* 內容欄寬 = totalPx */}
              </colgroup>

              <thead>
                <tr>
                  <th
                    style={{
                      position: "sticky", left: 0, zIndex: 2, // 讓 header 的左欄也固定
                      background: "#fafafa", border: "1px solid #ddd",
                      padding: "6px 12px", textAlign: "left", whiteSpace: "nowrap",
                    }}
                  >
                    列
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 12px",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    內容（前幾欄預覽）
                  </th>
                </tr>
              </thead>

              <tbody>
                {grid.slice(0, 10).map((row, rIdx) => (
                  <tr
                    key={`r:${rIdx}`}
                    onClick={() => setSel(rIdx)}
                    style={{ cursor: "pointer", background: sel === rIdx ? "rgba(88,50,37,0.08)" : "transparent" }}
                  >
                    {/* 左欄固定 */}
                    <td
                      style={{
                        position: "sticky", left: 0, zIndex: 1,
                        background: "#fafafa",
                        border: "1px solid #ddd",
                        padding: "6px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rIdx + 1}{sel === rIdx ? " ★" : ""}
                    </td>

                    {/* 右欄內容：不再各列自滾，寬度直接等於 totalPx */}
                    <td style={{ border: "1px solid #ddd", padding: 0 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: templatePxForRow(row),
                          width: `${totalPx}px`, // 🔑 固定像素寬 → 一起跟著單一水平捲軸移動
                        }}
                      >
                        {(row ?? []).map((cell, i) => (
                          <div
                            key={`c:${rIdx}:${i}`}
                            style={{
                              borderRight: i === (row?.length ?? 0) - 1 ? "none" : "1px solid #eee",
                              padding: "6px 12px",
                              whiteSpace: "nowrap",
                              overflow: "visible",
                              lineHeight: 1.5,
                              letterSpacing: "0.2px",
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
          </div>

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
