import { useRef, useState, useMemo } from "react";
import { readWorkbookFirstSheet, sheetToObjects } from "@/features/admin/utils/xlsx";

export function useAdminWorkbook() {
  // 檔案與錯誤訊息
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const fileInputRef = useRef(null);

  // 解析結果
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [rawGrid, setRawGrid] = useState([]);
  const [selectedHeaderRow, setSelectedHeaderRow] = useState(null);

  // 工作表相關狀態
  const wbRef = useRef(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [worksheet, setWorksheet] = useState(null);
  const [headerRowBySheet, setHeaderRowBySheet] = useState({});
  const [visibleBySheet, setVisibleBySheet] = useState({});
  const [visibleFields, setVisibleFields] = useState([]);

  function resetInput() {
    setInputKey((k) => k + 1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

  async function handlePickFile(file) {
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name)) {
      setError("請選擇 .xlsx 檔案");
      clearFile();
      return;
    }
    setError("");
    setFile(file);

    try {
      const { wb, sheetNames, ws, sheetName, headers, rows, hdrRow, grid } =
        await readWorkbookFirstSheet(file, headerRowBySheet);

      wbRef.current = wb;
      setSheetNames(sheetNames);
      setSheetIdx(0);
      setWorksheet(ws);
      setHeaders(headers);
      setRows(rows);
      setSelectedHeaderRow(hdrRow);
      setRawGrid(grid);
      setVisibleFields(visibleBySheet[sheetName] ?? []);
    } catch (err) {
      console.error(err);
      setError("解析 Excel 時發生錯誤，請確認檔案內容");
      clearFile();
    }
  }

  function switchSheet(nextIdx) {
    const idx = Number(nextIdx);
    setSheetIdx(idx);
    const name = sheetNames[idx];
    const ws = wbRef.current.Sheets[name];
    setWorksheet(ws);

    const override = headerRowBySheet[name] ?? null;
    const { headers, rows, hdrRow, grid } = sheetToObjects(ws, override);
    setHeaders(headers);
    setRows(rows);
    setSelectedHeaderRow(hdrRow);
    setRawGrid(grid);
    setVisibleFields(visibleBySheet[name] ?? []);
  }

  function setHeaderRow(rowIndex) {
    if (!worksheet) return;
    const { headers, rows, hdrRow, grid } = sheetToObjects(worksheet, rowIndex);
    setHeaders(headers);
    setRows(rows);
    setSelectedHeaderRow(hdrRow);
    setRawGrid(grid);
    setVisibleFields([]); // 換標題列後需重新挑選欄位
    setHeaderRowBySheet((prev) => ({ ...prev, [sheetNames[sheetIdx]]: rowIndex }));
  }

  const activeFields = useMemo(
    () => (visibleFields.length ? visibleFields : headers),
    [visibleFields, headers]
  );

  return {
    // 狀態
    file, error, inputKey, fileInputRef,
    headers, rows, rawGrid, selectedHeaderRow,
    sheetNames, sheetIdx, visibleFields, activeFields,

    // 操作
    setVisibleFields: (fields) => {
      setVisibleFields(fields);
      const name = sheetNames[sheetIdx];
      if (name) setVisibleBySheet((prev) => ({ ...prev, [name]: fields }));
    },
    setError,
    clearFile,
    handlePickFile,
    switchSheet,
    setHeaderRow,
  };
}
