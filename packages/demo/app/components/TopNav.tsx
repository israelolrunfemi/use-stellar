import type { CSSProperties } from "react";
import Link from "next/link";

export function TopNav() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(12px)", background: "rgba(15,15,15,0.84)", borderBottom: "1px solid #2a2a2a" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#f0f0f0", textDecoration: "none", fontWeight: 700, letterSpacing: 0 }}>
          use<span style={{ color: "#7dd3fc" }}>-stellar</span>
        </Link>
        <div style={{ display: "flex", gap: 22, fontSize: 14 }}>
          <Link href="/docs" style={navLink}>Docs</Link>
          <a href="https://github.com/israelolrunfemi/use-stellar" style={navLink}>GitHub</a>
          <a href="https://www.npmjs.com/package/use-stellar" style={navLink}>npm</a>
        </div>
        <div />
      </div>
    </nav>
  );
}

const navLink: CSSProperties = { color: "#f0f0f0", textDecoration: "none" };

