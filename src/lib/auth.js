// src/lib/auth.js
export const AUTH_KEY = "role";

export function setRole(role) {
  localStorage.setItem(AUTH_KEY, role);
}

export function getRole() {
  return localStorage.getItem(AUTH_KEY); // 可能為 "ADMIN" / "USER" / null
}

export function isLoggedIn() {
  return !!getRole();
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
