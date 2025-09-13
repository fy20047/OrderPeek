// src/routes/RoleRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getRole } from "../lib/auth";

/**
 * <RoleRoute allow="ADMIN" /> 或 <RoleRoute allow={["ADMIN","USER"]} />
 * 會先檢查 localStorage 的 role。
 * - 沒 role：導回 "/"
 * - 有 role 但不在 allow 裡：導回 "/"
 * - 符合：渲染子路由 (<Outlet />)
 */
export default function RoleRoute({ allow }) {
  const role = getRole(); // 從 localStorage 讀角色

  if (!role) return <Navigate to="/" replace />;

  const allowed = Array.isArray(allow) ? allow.includes(role) : role === allow;
  if (!allowed) return <Navigate to="/" replace />;

  return <Outlet />; // 通過檢查才渲染子頁面
} 
