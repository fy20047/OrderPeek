import LogoutButton from "../components/LogoutButton.jsx";

export default function UserApp() {
  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ flex: 1 }}>使用者頁面</h1>
        <LogoutButton /> {/* 右上角登出 */}
      </header>
      <p>這裡之後會放使用者功能。</p>
    </div>
  );
}
