// ?��??�「可見�?�?+ �??後�??�」發佈到 localStorage，給 /app 顯示
const KEY = "op_published";

export function savePublished(visibleFields, rows) {
  const payload = { visibleFields, rows, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(payload));
  try {
    window.dispatchEvent(new CustomEvent("op:published", { detail: payload }));
  } catch {}
}

export function loadPublished() {
  try {
    const text = localStorage.getItem(KEY);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export function clearPublished() {
  localStorage.removeItem(KEY);
}


