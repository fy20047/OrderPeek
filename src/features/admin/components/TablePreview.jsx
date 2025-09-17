const labelOf = (key) => String(key).replace(/_\d+$/, "");

function computeColWidths(fields, sampleRows) {
  return fields.map((field) => {
    const texts = [labelOf(field), ...sampleRows.map((row) => String(row?.[field] ?? ""))];
    const maxLen = Math.max(1, ...texts.map((text) => text.length));
    const px = Math.round(maxLen * 12);
    return Math.max(80, px);
  });
}

export default function TablePreview({ headers, rows, activeFields, previewRows = 8 }) {
  if (!headers?.length) return null;

  const filteredRows = rows.map((row) => {
    const picked = {};
    activeFields.forEach((field) => {
      picked[field] = row[field];
    });
    return picked;
  });

  const sample = filteredRows.slice(0, previewRows);
  const colWidths = computeColWidths(activeFields, sample);

  return (
    <div style={{ marginTop: 16 }}>
      {!!(activeFields?.length && activeFields.length !== headers.length) && (
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          已選欄位：{activeFields.map(labelOf).join("、")}
        </div>
      )}

      <div className="tableScroll">
        <div style={{ overflowX: "auto", overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
          <table className="fullwidth-table">
            <colgroup>
              {colWidths.map((width, index) => (
                <col key={index} style={{ width }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                {activeFields.map((field) => (
                  <th
                    key={field}
                    style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left", whiteSpace: "nowrap" }}
                  >
                    {labelOf(field)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sample.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {activeFields.map((field) => (
                    <td key={field} style={{ border: "1px solid #ddd", padding: "8px", whiteSpace: "nowrap" }}>
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