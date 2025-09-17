import LogoutButton from "@/shared/components/LogoutButton.jsx";
import ErrorMessage from "@/shared/components/ErrorMessage.jsx";
import ColumnPickerModal from "@/shared/components/ColumnPickerModal.jsx";
import HeaderRowPickerModal from "@/shared/components/HeaderRowPickerModal.jsx";
import { savePublished } from "@/features/publish/api.js";

import { useState, useEffect } from "react";
import { useAdminWorkbook } from "@/features/admin/hooks/useAdminWorkbook.js";
import FileInfoBar from "@/features/admin/components/FileInfoBar.jsx";
import TablePreview from "@/features/admin/components/TablePreview.jsx";

export default function Admin() {
  const {
    file, error, inputKey, fileInputRef,
    headers, rows, rawGrid, selectedHeaderRow,
    sheetNames, sheetIdx, visibleFields, activeFields,
    setVisibleFields, setHeaderRow, setError,
    clearFile, handlePickFile, switchSheet,
  } = useAdminWorkbook();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [headerPickerOpen, setHeaderPickerOpen] = useState(false);
  const [publishInfo, setPublishInfo] = useState("");

  useEffect(() => {
    setPublishInfo("");
  }, [headers, rows, visibleFields]);

  return (
    <div className="page">
      <header className="header">
        <div className="brand" style={{ flex: 1 }}>OrderPeek 管理頁面</div>
        <LogoutButton />
      </header>

      <main className="main">
        <section className="card card-wide" aria-label="Admin card">
          <h2 style={{ marginTop: 0 }}>上傳 Excel 檔案</h2>

          <input
            key={inputKey}
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
            onClick={(e) => {
              e.currentTarget.value = "";
            }}
            style={{ marginTop: 12, marginBottom: 12 }}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FileInfoBar
            file={file}
            onClear={clearFile}
            onOpenColumnPicker={() => setPickerOpen(true)}
            onOpenHeaderPicker={() => setHeaderPickerOpen(true)}
            hasHeaders={headers.length > 0}
          />

          {/* 工作表切換 */}
          {sheetNames.length > 1 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>切換工作表</span>
              <select value={sheetIdx} onChange={(e) => switchSheet(e.target.value)}>
                {sheetNames.map((name, index) => (
                  <option key={name} value={index}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 表格預覽 */}
          <TablePreview headers={headers} rows={rows} activeFields={activeFields} previewRows={8} />

          {/* 發佈區塊 */}
          {headers.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginTop: 12 }}>
              {publishInfo && (
                <div style={{ fontSize: 14, opacity: 0.85 }}>{publishInfo}</div>
              )}
              <button
                type="button"
                className="logoutBtn"
                onClick={() => {
                  savePublished(visibleFields, rows);
                  setPublishInfo("已成功發佈");
                }}
              >
                發佈至前端
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 欄位選擇視窗 */}
      <ColumnPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        headers={headers}
        rows={rows}
        initialSelected={visibleFields.length ? visibleFields : headers}
        onSave={(selected) => {
          setVisibleFields(selected);
          setPickerOpen(false);
        }}
        displayName={(key) => String(key).replace(/_\d+$/, "")}
      />

      {/* 標題列選擇視窗 */}
      <HeaderRowPickerModal
        open={headerPickerOpen}
        onClose={() => setHeaderPickerOpen(false)}
        grid={rawGrid}
        initialRow={selectedHeaderRow ?? 0}
        onSave={(rowIndex) => {
          setHeaderRow(rowIndex);
          setHeaderPickerOpen(false);
          setPickerOpen(true);
        }}
      />
    </div>
  );
}
