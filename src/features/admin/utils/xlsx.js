import * as XLSX from "xlsx";

export const normalizeHeader = (s) =>
  String(s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function uniquifyHeaders(arr) {
  const used = new Map();
  return arr.map((h, i) => {
    const base = h && h.length ? h : `欄位${i + 1}`;
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}_${n}`;
  });
}

export function findHeaderRow(ws) {
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

/** 將工作表轉為 { headers, rows, hdrRow, grid }，可覆寫標題列 */
export function sheetToObjects(ws, headerRowOverride = null) {
  const rng = XLSX.utils.decode_range(ws["!ref"]);
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });

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

  const data = XLSX.utils.sheet_to_json(ws, {
    range: dataRange,
    header: uniqHdrs,
    defval: "",
    raw: false,
    dateNF: "yyyy/mm/dd",
  });

  return { headers: uniqHdrs, rows: data, hdrRow, grid };
}

/** 讀檔 → 產生 workbook 物件與第一個 sheet 的解析結果 */
export async function readWorkbookFirstSheet(file, headerRowBySheet = {}) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array", cellDates: true });
  const sheetNames = wb.SheetNames;
  const firstName = sheetNames[0];
  const ws = wb.Sheets[firstName];
  const override = headerRowBySheet[firstName] ?? null;
  const parsed = sheetToObjects(ws, override);
  return { wb, sheetNames, ws, sheetName: firstName, ...parsed };
}
