export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px",
        border: "1px solid var(--border)",
        background: "#fff",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
