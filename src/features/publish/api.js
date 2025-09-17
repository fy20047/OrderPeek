// ?«æ??Šã€Œå¯è¦‹æ?ä½?+ è§??å¾Œè??™ã€ç™¼ä½ˆåˆ° localStorageï¼Œçµ¦ /app é¡¯ç¤º
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


