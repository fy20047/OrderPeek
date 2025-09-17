export default function FileInfoBar({
  file,
  onClear,
  onOpenColumnPicker,
  onOpenHeaderPicker,
  hasHeaders,
}) {
  if (!file) return null;
  return (
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
      <span style={{ opacity: 0.7 }}>（{(file.size / 1024).toFixed(1)} KB）</span>

      <button type="button" onClick={onClear} className="logoutBtn" style={{ marginLeft: "auto" }}>
        移除
      </button>

      {hasHeaders && (
        <>
          <button type="button" className="logoutBtn" onClick={onOpenColumnPicker}>
            選擇要公開的欄位
          </button>
          <button type="button" className="logoutBtn" onClick={onOpenHeaderPicker}>
            選擇標題列
          </button>
        </>
      )}
    </div>
  );
}
