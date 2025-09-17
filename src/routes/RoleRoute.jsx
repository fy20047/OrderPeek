// src/routes/RoleRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getRole } from "@/features/auth/api.js";

export default function RoleRoute({ allow }) {
  const role = getRole()?.toUpperCase(); 

  if (!role) return <Navigate to="/" replace />;

  const allowed = Array.isArray(allow) ? allow.includes(role) : role === allow;
  if (!allowed) return <Navigate to="/" replace />;

  return <Outlet />; 
} 
