export const AUTH_KEY = "role";
export const ROLES = { ADMIN: "admin", USER: "user" };

export function setRole(role) {
  // 以小寫儲存，避免後續比較時大小寫不一致
  localStorage.setItem(AUTH_KEY, String(role || "").toLowerCase());
}

export function getRole() {
  const value = localStorage.getItem(AUTH_KEY); // 可能回傳 "admin"、"user" 或 null
  return value ? String(value).toLowerCase() : null;
}

export function isLoggedIn() {
  return !!getRole();
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
