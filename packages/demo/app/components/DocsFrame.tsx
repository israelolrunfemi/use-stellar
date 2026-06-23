"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type NavGroup = { title: string; items: { label: string; href: string }[] };

export function DocsFrame({ groups, children }: { groups: NavGroup[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebar = (
    <aside style={{
      width: mobile ? "100%" : 280,
      flexShrink: 0,
      borderRight: mobile ? "none" : "1px solid #2a2a2a",
      borderBottom: mobile ? "1px solid #2a2a2a" : "none",
      background: "#0f0f0f",
      position: mobile ? "relative" : "sticky",
      top: 0,
      height: mobile ? "auto" : "100vh",
      overflowY: "auto",
      padding: 20,
      boxSizing: "border-box",
    }}>
      <Link href="/" style={{ color: "#f0f0f0", textDecoration: "none", fontWeight: 700, display: "block", marginBottom: 24 }}>use<span style={{ color: "#7dd3fc" }}>-stellar</span></Link>
      {groups.map(group => (
        <div key={group.title} style={{ marginBottom: 24 }}>
          <div style={{ color: "#666666", fontSize: 12, textTransform: "uppercase", marginBottom: 8 }}>{group.title}</div>
          {group.items.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 10px", borderRadius: 8, color: active ? "#f0f0f0" : "#a8a8a8", background: active ? "#1a1a1a" : "transparent", border: active ? "1px solid #2a2a2a" : "1px solid transparent", textDecoration: "none", fontSize: 14 }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );

  return (
    <div style={{ minHeight: "100vh", display: mobile ? "block" : "flex", background: "#0f0f0f" }}>
      {mobile ? (
        <div style={{ borderBottom: "1px solid #2a2a2a", padding: 14, position: "sticky", top: 0, background: "#0f0f0f", zIndex: 10 }}>
          <button type="button" onClick={() => setOpen(!open)} style={{ border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#f0f0f0", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace" }}>{open ? "Close" : "Menu"}</button>
          {open ? sidebar : null}
        </div>
      ) : sidebar}
      <main style={{ flex: 1, minWidth: 0, height: mobile ? "auto" : "100vh", overflowY: mobile ? "visible" : "auto" }}>
        <div style={{ maxWidth: 920, padding: mobile ? "30px 20px 60px" : "58px 56px 90px" }}>{children}</div>
      </main>
    </div>
  );
}
