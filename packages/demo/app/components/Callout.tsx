export function Callout({ type, children }: { type: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const color = type === "warning" ? "#facc15" : type === "tip" ? "#4ade80" : "#7dd3fc";
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: "#1a1a1a", borderRadius: 8, padding: "14px 16px", color: "#cfcfcf", lineHeight: 1.65 }}>
      {children}
    </div>
  );
}
