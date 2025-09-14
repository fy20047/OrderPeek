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
import { useState, useRef  } from "react";
import * as XLSX from "xlsx";
import LogoutButton from "../components/LogoutButton.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import ColumnPickerModal from "../components/ColumnPickerModal.jsx";
import HeaderRowPickerModal from "../components/HeaderRowPickerModal.jsx";
import { savePublished } from "../lib/publish.js";

export default function Admin() {
  // 檔案/錯誤
  const [file, setFile] = useState(null);  // 目前選到的檔案
  const [error, setError] = useState("");  // 檔案格式錯誤等訊息
  const [inputKey, setInputKey] = useState(0); // 重置 <input type="file" /> 用

  // 解析結果
  const [headers, setHeaders] = useState([]);  // 解析出的欄位
  const [rows, setRows] = useState([]);        // 解析出的資料列（物件陣列）

  // 欄位挑選視窗
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState([]); // 管理者選擇要公開的欄位

  // 手動標題列挑選
  const [headerPickerOpen, setHeaderPickerOpen] = useState(false);
  const [rawGrid, setRawGrid] = useState([]);       // 2D array 預覽
  const [selectedHeaderRow, setSelectedHeaderRow] = useState(null);
  const [worksheet, setWorksheet] = useState(null); // 暫存 ws 以便重解析

  const wbRef = useRef(null);                     // 暫存整本 workbook
  const [sheetNames, setSheetNames] = useState([]); 
  const [sheetIdx, setSheetIdx] = useState(0);    // 目前選到哪個 sheet

  // 各工作表的設定（用 sheet 名稱當 key）
  const [headerRowBySheet, setHeaderRowBySheet] = useState({});
  const [visibleBySheet, setVisibleBySheet] = useState({});

  const fileInputRef = useRef(null);

  const labelOf = (key) => String(key).replace(/_\d+$/, "");

  function resetInput() {
    setInputKey(k => k + 1);                   // 強制重新掛載 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";         // 直接清空 value
    }
  }

  // --------- 工具：欄名正規化 / 唯一化 / 自動找標題列 ---------
  const normalizeHeader = (s) =>
    String(s ?? "")
      .replace(/\u00A0/g, " ")   // non-breaking space -> space
      .replace(/\s+/g, " ")      // 摺疊連續空白
      .trim();

  function uniquifyHeaders(arr) {
    const used = new Map();
    return arr.map((h, i) => {
      const base = h && h.length ? h : `欄位${i + 1}`;
      const n = (used.get(base) || 0) + 1;
      used.set(base, n);
      return n === 1 ? base : `${base}_${n}`;
    });
  }

  // ---- 嘗試自動找標題列（前 20 列內找非空最多的那列）----
  function findHeaderRow(ws) {
    const ref = XLSX.utils.decode_range(ws["!ref"]);
    let bestRow = ref.s.r, bestCnt = -1;
    for (let r = ref.s.r; r <= Math.min(ref.e.r, ref.s.r + 20); r++) {
      let cnt = 0;
      for (let c = ref.s.c; c <= ref.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell && String(cell.v).trim() !== "") cnt++;
      }
      if (cnt > bestCnt) { bestCnt = cnt; bestRow = r; }
    }
    return bestRow;
  }

  // ---- 將工作表轉為 {headers, rows}，可覆寫標題列 ----
  function sheetToObjects(ws, headerRowOverride = null) {
    const rng = XLSX.utils.decode_range(ws["!ref"]);

    // 給預覽用的 2D 陣列（方便除錯）
    const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    setRawGrid(grid);

    const hdrRow = (typeof headerRowOverride === "number")
      ? headerRowOverride
      : findHeaderRow(ws);

    // 取標題列
    const rawHdrs = [];
    for (let c = rng.s.c; c <= rng.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: hdrRow, c })];
      rawHdrs.push(cell ? cell.v : "");
    }
    const normalized = rawHdrs.map(normalizeHeader);
    const uniqHdrs   = uniquifyHeaders(normalized);

    // 資料範圍：從下一列開始
    const dataRange = XLSX.utils.encode_range(
      { r: hdrRow + 1, c: rng.s.c },
      { r: rng.e.r,   c: rng.e.c }
    );

    // 這一步是關鍵：用我們自己正規化好的 header 當鍵名
    const data = XLSX.utils.sheet_to_json(ws, {
      range: dataRange,
      header: uniqHdrs,
      defval: "",
      raw: false,               // 讓日期依格式輸出
      dateNF: "yyyy/mm/dd",     // 想顯示 2025/03/03 就用這個
    });

    setSelectedHeaderRow(hdrRow);
    return { headers: uniqHdrs, rows: data, hdrRow };
  }

  // --------- 清除檔案/狀態 ----------
  function clearFile() {
    setFile(null);
    setError("");
    setHeaders([]);
    setRows([]);
    setVisibleFields([]);
    setWorksheet(null);
    setRawGrid([]);
    setSelectedHeaderRow(null);
    resetInput();
  }

  // 簡單估算每欄理想寬度（字數 * 12px），並限制在 80~240px
  const computeColWidths = (fields, sampleRows) => {
    return fields.map((f) => {
      const texts = [
        labelOf(f),                           // 表頭
        ...sampleRows.map((r) => String(r?.[f] ?? ""))  // 前幾列內容
      ];
      const maxLen = Math.max(1, ...texts.map(t => t.length));
      const px = Math.round(maxLen * 12);
      return Math.max(80, Math.min(240, px));
    });
  };

  // --------- 選檔並解析（單檔、取第一個工作表） ----------
  function handlePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    // 僅接受 .xlsx / .xls
    if (!/\.xlsx?$/i.test(f.name)) {
      setError("請選擇 .xlsx 檔案");
      clearFile();
      return;
    }

    setError("");
    setFile(f);
  
    // 讀檔並解析
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = new Uint8Array(fr.result);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        wbRef.current = wb;
        setSheetNames(wb.SheetNames);
        setSheetIdx(0);

        const firstName = wb.SheetNames[0];
        const ws = wb.Sheets[firstName];
        setWorksheet(ws);

        const override = headerRowBySheet[firstName] ?? null;
        const { headers: hdrs, rows: json, hdrRow } = sheetToObjects(ws, override);
        setHeaders(hdrs);
        setRows(json);
        setSelectedHeaderRow(hdrRow);
        setPickerOpen(true); // 打開欄位挑選視窗 
      } catch (err) {
        console.error(err);
        setError("解析 Excel 時發生錯誤，請確認檔案內容。");
        clearFile();
      }
    };
    fr.readAsArrayBuffer(f);
  }

  function handleSaveVisibleFields(selected) {
    setVisibleFields(selected);
    setPickerOpen(false);
  }

  // 依可見欄位裁切資料（此時鍵名已保證一致）
  const activeFields = (visibleFields.length ? visibleFields : headers);
  const filteredRows = rows.map(r => {
    const obj = {};
    activeFields.forEach(f => (obj[f] = r[f]));
    return obj;
  });
  
  // 預覽顯示幾列；同一個常數同時用於「欄寬估算」與「實際渲染列數」
  const PREVIEW_ROWS = 8;
  const previewSample = filteredRows.slice(0, PREVIEW_ROWS);
  const colWidths = computeColWidths(activeFields, previewSample);

  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 管理員後台</div>
        <LogoutButton /> {/* 右上角登出 */}
      </header>

      <main className="main">
        <section className="card card-wide" aria-label="Admin card">
           <h2 style={{ marginTop: 0 }}>上傳 Excel 檔案</h2>

          <input
            key={inputKey}                            // key 改變會重掛 input
            ref={fileInputRef}                        // 可以直接清 value
            type="file"
            accept=".xlsx,.xls"
            onChange={handlePick}
            onClick={(e) => { e.currentTarget.value = ""; }} // ← 進一步保險：每次點都清空
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
                <>
                  <button type="button" className="logoutBtn" onClick={() => setPickerOpen(true)}>
                    選擇要公開的欄位
                  </button>
                  <button type="button" className="logoutBtn" onClick={() => setHeaderPickerOpen(true)}>
                    選擇標題列
                  </button>
                </>
              )}

            </div>
          )}

          {/* 工作表切換器 */}
          {sheetNames.length > 1 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>工作表：</span>
              <select
                value={sheetIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSheetIdx(idx);
                  const name = sheetNames[idx];
                  const ws = wbRef.current.Sheets[name];
                  setWorksheet(ws);

                  const override = headerRowBySheet[name] ?? null;
                  const { headers: hdrs, rows: json, hdrRow } = sheetToObjects(ws, override);
                  setHeaders(hdrs);
                  setRows(json);
                  setSelectedHeaderRow(hdrRow);
                  setVisibleFields(visibleBySheet[name] ?? []); // 每張 sheet 自己的可見欄位
                }}
              >
                {sheetNames.map((n, i) => (
                  <option key={n} value={i}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* 預覽資料表 */}
          {(headers.length > 0) && (
            <div style={{ marginTop: 16 }}>
              {!!visibleFields.length && (
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  已選欄位：{(visibleFields.length ? visibleFields : headers).map(labelOf).join("、")}
                </div>
              )}

              <div className="tableScroll">
                <div style={{ overflowX: "auto", overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                  {/* width:100% 讓表格吃滿容器；min-width 交給 index.css 的 .tableScroll table 控制 */}
                  <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
                    <colgroup>
                      {colWidths.map((w, i) => (
                        <col key={i} style={{ width: w }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr style={{ background: "#f8f8f8" }}>
                        {activeFields.map((h) => (
                          <th key={h} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left", whiteSpace: "nowrap" }}>{labelOf(h)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.slice(0, PREVIEW_ROWS).map((row, idx) => (
                        <tr key={idx}>
                          {activeFields.map((h) => (
                            <td key={h} style={{ border: "1px solid #ddd", padding: "8px", whiteSpace: "nowrap" }}>
                              {row?.[h] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
                （目前僅在前端預覽；之後會把「可見欄位」設定送到後端保存）
              </p>
              
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  type="button"
                  className="logoutBtn"
                  onClick={() => savePublished(visibleFields, rows)}
                >
                  發佈給使用者
                </button>
              </div>
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
        displayName={(k) => String(k).replace(/_\d+$/, "")}   // 顯示用名稱
      />

      {/* 手動選標題列 */}
      <HeaderRowPickerModal
        open={headerPickerOpen}
        onClose={() => setHeaderPickerOpen(false)}
        grid={rawGrid}
        initialRow={selectedHeaderRow ?? 0}
        onSave={(rowIndex) => {
          setHeaderPickerOpen(false);
          if (!worksheet) return;
          const { headers: hdrs, rows: json } = sheetToObjects(worksheet, rowIndex);
          setHeaders(hdrs);
          setRows(json);
          // 若原本有挑欄，若新標題集合與舊的對不上可能會變空；這裡直接清掉讓你重選
          setVisibleFields([]);
          setPickerOpen(true); // 選完標題列後立刻重選欄位（可選）
        }}
      />

    </div>
  );
}

