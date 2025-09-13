// src/components/ErrorMessage.jsx
export default function ErrorMessage({ children }) {
  return (
    <div
      style={{
        background: "#FEE2E2",
        color: "#7F1D1D",
        border: "1px solid #FCA5A5",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 14,
        marginTop: 12,
      }}
      role="alert"
    >
      {children}
    </div>
  );
}
