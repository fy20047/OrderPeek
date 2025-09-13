// import { logout } from "../lib/auth.js";
// import { useNavigate } from "react-router-dom";
// import LogoutButton from "../components/LogoutButton.jsx";

// export default function Admin() {
//   const nav = useNavigate();
//   return (
//     <div style={{ padding: "1rem" }}>
//       <header style={{ display: "flex", alignItems: "center" }}>
//         <h1 style={{ flex: 1 }}>管理員頁面</h1>
//         <LogoutButton /> {/* 右上角登出 */}
//       </header>
//       <p>這裡之後會放管理員功能。</p>
//     </div>
//   );
// }
import { useState } from "react";
import * as XLSX from "xlsx";
import LogoutButton from "../components/LogoutButton.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import ColumnPickerModal from "../components/ColumnPickerModal.jsx";

export default function Admin() {
  const [file, setFile] = useState(null);  // 目前選到的檔案
  const [error, setError] = useState("");  // 檔案格式錯誤等訊息
  const [inputKey, setInputKey] = useState(0); // 重置 <input type="file" /> 用

  const [headers, setHeaders] = useState([]);  // 解析出的欄位
  const [rows, setRows] = useState([]);        // 解析出的資料列（物件陣列）
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState([]); // 管理者選擇要公開的欄位

  function handlePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    // 僅接受 .xlsx / .xls
    if (!/\.xlsx?$/i.test(f.name)) {
      setFile(null);
      setError("請選擇 .xlsx 檔案");
      // 重置 input 的值，避免再次選同一檔案時 onChange 不觸發
      resetInput();
      return;
    }

    setError("");
    setFile(f);
  
    function clearFile() {
    setFile(null);
    setError("");
    setInputKey(k => k + 1); // 也把 input 清乾淨
  }

  // 讀檔並解析
    const fr = new FileReader();
    fr.onload = () => {
      const data = new Uint8Array(fr.result);
      const wb = XLSX.read(data, { type: "array" });
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];

      // 轉陣列，每列是一個物件，第一列當標題
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" }); // defval: 空白用空字串
      const hdrs = extractHeaders(ws);

      setHeaders(hdrs);
      setRows(json);
      setPickerOpen(true); // 打開欄位挑選視窗
    };
    fr.readAsArrayBuffer(f);
  }

  function extractHeaders(worksheet) {
    // 從工作表的第一列取欄位名稱（遇到空欄位就給預設名稱）
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const firstRow = range.s.r;
    const hdrs = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: firstRow, c: C });
      const cell = worksheet[cellAddress];
      let v = cell ? String(cell.v).trim() : "";
      if (!v) v = `欄位${C + 1}`;
      hdrs.push(v);
    }
    return hdrs;
  }

  function clearFile() {
    setFile(null);
    setError("");
    setHeaders([]);
    setRows([]);
    setVisibleFields([]);
    resetInput();
  }

  function handleSaveVisibleFields(selected) {
    setVisibleFields(selected);
    setPickerOpen(false);
  }

  // 根據 visibleFields 過濾 rows，做預覽
  const filteredRows = rows.map((r) => {
    const obj = {};
    visibleFields.forEach((f) => (obj[f] = r[f]));
    return obj;
  });

  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 管理員後台</div>
        <LogoutButton /> {/* 右上角登出 */}
      </header>

      <main className="main">
        <section className="card" aria-label="Admin card">
           <h2 style={{ marginTop: 0 }}>上傳 Excel 檔案</h2>

          <input
            key={inputKey}
            type="file"
            accept=".xlsx,.xls"
            onChange={handlePick}
            style={{ marginTop: 12, marginBottom: 12 }}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {file && ( // 使用者選了一個檔案，就顯示檔案資訊
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                background: "#f7f7f7",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>已選檔案：</span>
              <strong style={{ wordBreak: "break-all" }}>{file.name}</strong>  
              <span style={{ opacity: 0.7 }}>
                （{(file.size / 1024).toFixed(1)} KB）
              </span>

              <button
                type="button"
                onClick={clearFile}
                className="logoutBtn" // 移除按鈕，w沿用風格
                style={{ marginLeft: "auto" }}
              >
                移除
              </button>
              
              {headers.length > 0 && (
                <button
                  type="button"
                  className="submitBtn"
                  onClick={() => setPickerOpen(true)}
                >
                  選擇要公開的欄位
                </button>
              )}

            </div>
          )}

          {/* 顯示管理者選的欄位 */}
          {visibleFields.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                已選欄位：{visibleFields.join("、")}
              </div>
              <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f8f8" }}>
                      {visibleFields.map((h) => (
                        <th key={h} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {visibleFields.map((h) => (
                          <td key={h} style={{ border: "1px solid #ddd", padding: "8px" }}>
                            {row?.[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
                之後會在這裡顯示欄位清單，勾選要公開給使用者看的欄位。
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 欄位挑選視窗 */}
      <ColumnPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        headers={headers}
        rows={rows}
        initialSelected={visibleFields.length ? visibleFields : headers} // 預設全選
        onSave={handleSaveVisibleFields}
      />
    </div>
  );
}

