import Link from "next/link";

export function HookCard({ name, description, snippet, href }: { name: string; description: string; snippet: string; href: string }) {
  return (
    <Link href={href} style={{ display: "block", minHeight: 154, padding: 18, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, textDecoration: "none", color: "inherit" }}>
      <div style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: 15, marginBottom: 10 }}>{name}</div>
      <p style={{ margin: "0 0 16px", color: "#a8a8a8", fontSize: 14, lineHeight: 1.55 }}>{description}</p>
      <code style={{ display: "block", fontFamily: "monospace", color: "#f0f0f0", background: "#111111", border: "1px solid #2a2a2a", borderRadius: 8, padding: 10, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>{snippet}</code>
    </Link>
  );
}
