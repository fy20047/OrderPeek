import { logout } from "../../features/auth/api.js";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const nav = useNavigate();

  function handleLogout() {
    logout();            // 清掉 localStorage 的 role
    nav("/", { replace: true }); // 導回登入頁
  }

  return (
    <button className="logoutBtn" onClick={handleLogout}>
      登出
    </button>
  );
}
