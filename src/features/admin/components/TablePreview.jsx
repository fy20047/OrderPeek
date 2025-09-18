// src/features/admin/components/TablePreview.jsx
const labelOf = (key) => String(key).replace(/_\d+$/, "");

function computeColWidths(fields, sampleRows) {
  const GUTTER_PX = 12;
  return fields.map((field) => {
    const texts = [labelOf(field), ...sampleRows.map((row) => String(row?.[field] ?? ""))];
    const maxLen = Math.max(1, ...texts.map((text) => text.length));
    const px = Math.round(maxLen * 12);          // 粗估每字 12px
    return Math.max(80, px + GUTTER_PX);         // 至少 80px，留一點 gutter
  });
}

export default function TablePreview({ headers, rows, activeFields, previewRows = 8 }) {
  if (!headers?.length) return null;

  const fields = (activeFields && activeFields.length) ? activeFields : headers;

  const filteredRows = rows.map((row) => {
    const picked = {};
    fields.forEach((field) => { picked[field] = row[field]; });
    return picked;
  });

  const sample = filteredRows.slice(0, previewRows);
  const colWidths = computeColWidths(fields, sample);
  const totalBasePx = colWidths.reduce((a, b) => a + b, 0);
  const colPct = 100 / Math.max(1, fields.length); // 平均等分下限

  return (
    <div style={{ marginTop: 16 }}>
      {!!(fields?.length && fields.length !== headers.length) && (
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          已選欄位：{fields.map(labelOf).join("、")}
        </div>
      )}

      {/* 只開水平滾輪；避免被父層撐破 */}
      <div className="tableScroll" style={{ minWidth: 0, maxWidth: "100%" }}>
        <div
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            border: "1px solid var(--border)",
            borderRadius: 8,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table
            className="fullwidth-table"
            style={{
              width: "max(100%, totalBasePx)",           
              tableLayout: "fixed",
              borderCollapse: "collapse",
              whiteSpace: "nowrap",            // ✅ 單行顯示，不換行
            }}
          >
            <colgroup>
              {colWidths.map((w, i) => (
                <col
                  key={`col:${i}:${fields[i] ?? ""}`}
                  style={{ width: `max(${colPct}%, ${w}px)` }} // 平均寬與內容寬取大者
                />
              ))}
            </colgroup>

            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                {fields.map((field, i) => (
                  <th
                    key={`th:${i}:${field}`}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px 12px",     // ✅ 上下 8、左右 12
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      lineHeight: 1.5,
                    }}
                  >
                    {labelOf(field)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sample.map((row, rowIndex) => (
                <tr key={`tr:${rowIndex}`}>
                  {fields.map((field, colIndex) => (
                    <td
                      key={`td:${rowIndex}:${colIndex}:${field}`}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px 12px",   // ✅ 上下 8、左右 12
                        whiteSpace: "nowrap",
                        lineHeight: 1.5,
                      }}
                    >
                      {row?.[field] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
        （目前僅供前端預覽；之後會把「可見欄位」設定送到後端保存）
      </p>
    </div>
  );
}
