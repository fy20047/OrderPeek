import { logout } from "../lib/auth.js";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";

export default function Admin() {
  const nav = useNavigate();
  return (
    <div style={{ padding: "1rem" }}>
      <header style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ flex: 1 }}>管理員頁面</h1>
        <LogoutButton /> {/* 右上角登出 */}
      </header>
      <p>這裡之後會放管理員功能。</p>
    </div>
  );
}
